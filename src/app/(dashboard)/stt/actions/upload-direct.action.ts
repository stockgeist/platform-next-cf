'use server'

import { createServerAction } from 'zsa'
import { z } from 'zod'
import { ZSAError } from 'zsa'
import { requireVerifiedEmail } from '@/utils/auth'
import { uploadUserScopedToR2, validateAudioFile } from '@/utils/r2'
import { withRateLimit } from '@/utils/with-rate-limit'
import {
  createTranscriptionRecord,
  updateTranscriptionRecord,
} from '@/server/transcriptions'
import { revalidatePath } from 'next/cache'

async function transcribeAudio(
  audioBlob: Blob,
  language: string,
  fileName: string,
): Promise<string> {
  const sttUrl = process.env.STT_URL
  const sttToken = process.env.STT_TOKEN

  if (!sttUrl || !sttToken) {
    throw new Error('STT_URL and STT_TOKEN environment variables are required')
  }

  const form = new FormData()
  form.append('file', audioBlob, fileName)
  form.append('response_format', 'text')
  form.append('language', language)

  const response = await fetch(sttUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${sttToken}`,
    },
    body: form,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`STT API error: ${response.status} - ${errorText}`)
  }

  const transcription = await response.text()
  return transcription.trim()
}

// Schema for direct file upload
const directUploadSchema = z.object({
  audioFile: z.instanceof(File, { message: 'Audio file is required' }),
  language: z.string().min(1, 'Language is required'),
})

/**
 * Upload audio file directly to server, save to R2, and process transcription
 */
export const uploadAndTranscribeDirectAction = createServerAction()
  .input(directUploadSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const { audioFile, language } = input
        // Get user session
        const session = await requireVerifiedEmail()
        const userId = session?.user?.id
        if (!userId) {
          throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
        }

        // Validate the audio file
        const validation = validateAudioFile(audioFile)
        if (!validation.valid) {
          throw new ZSAError(
            'INPUT_PARSE_ERROR',
            validation.error || 'Invalid audio file',
          )
        }

        try {
          // Upload file to R2
          const uploadResult = await uploadUserScopedToR2(audioFile, userId, {
            contentType: audioFile.type,
            customMetadata: {
              language,
            },
          })

          // Create transcription record
          const transcriptionRecord = await createTranscriptionRecord({
            userId,
            r2Key: uploadResult.key,
            fileName: audioFile.name,
            fileSize: audioFile.size,
            language,
          })

          try {
            // Convert file to blob for transcription
            const audioBlob = await audioFile.arrayBuffer()
            const blob = new Blob([audioBlob], { type: audioFile.type })

            // Call real STT API
            const transcriptionText = await transcribeAudio(
              blob,
              language,
              audioFile.name,
            )

            // Update transcription record with success
            await updateTranscriptionRecord(transcriptionRecord.id, {
              status: 'completed',
              transcriptionText,
              processedAt: new Date(),
            })

            revalidatePath('/stt')
            return {
              success: true,
              data: {
                transcription: transcriptionText,
                key: uploadResult.key,
                url: uploadResult.url, //could also just use key
                fileName: audioFile.name,
                fileSize: audioFile.size,
                language,
                transcriptionId: transcriptionRecord.id,
                uploadMethod: 'direct-server',
              },
            }
          } catch (transcriptionError) {
            // Update transcription record with error
            await updateTranscriptionRecord(transcriptionRecord.id, {
              status: 'failed',
              errorMessage:
                transcriptionError instanceof Error
                  ? transcriptionError.message
                  : 'Unknown error',
              processedAt: new Date(),
            })

            throw transcriptionError
          }
        } catch (error) {
          console.error('Direct upload and transcribe error:', error)
          throw new ZSAError(
            'INTERNAL_SERVER_ERROR',
            error instanceof Error
              ? error.message
              : 'Failed to upload and transcribe audio. Please try again.',
          )
        }
      },
      {
        identifier: 'stt-direct-upload-transcribe',
        limit: 10, // 10 requests per window
        windowInSeconds: 60, // 1 minute window
      },
    )
  })
