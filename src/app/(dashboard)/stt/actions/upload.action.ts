'use server'

import { createServerAction } from 'zsa'
import { z } from 'zod'
import { ZSAError } from 'zsa'
import { requireVerifiedEmail } from '@/utils/auth'
import { validateAudioFile } from '@/utils/r2'
import { generatePresignedUploadUrl } from '@/lib/r2-client'
import { withRateLimit } from '@/utils/with-rate-limit'
import {
  createTranscriptionRecord,
  updateTranscriptionRecord,
} from '@/server/transcriptions'
// Real STT API call function
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

// Schema for file upload
const fileUploadSchema = z.object({
  audioFile: z.instanceof(File, { message: 'Audio file is required' }),
  language: z.string().min(1, 'Language is required'),
})

/**
 * Get presigned URL for direct client upload to R2
 */
export const getPresignedUploadUrlAction = createServerAction()
  .input(fileUploadSchema)
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
          // Generate presigned URL for client-side upload
          const key = `stt/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${audioFile.name.split('.').pop()}`
          const uploadUrl = await generatePresignedUploadUrl(
            key,
            audioFile.type,
            600,
          ) // 10 minutes

          return {
            success: true,
            data: {
              uploadUrl,
              key,
              fields: {
                'Content-Type': audioFile.type,
              },
              fileName: audioFile.name,
              fileSize: audioFile.size,
              language,
            },
          }
        } catch (error) {
          console.error('Presigned URL generation error:', error)
          throw new ZSAError(
            'INTERNAL_SERVER_ERROR',
            error instanceof Error
              ? error.message
              : 'Failed to generate upload URL. Please try again.',
          )
        }
      },
      {
        identifier: 'stt-presigned-url',
        limit: 20, // 20 requests per window
        windowInSeconds: 60, // 1 minute window
      },
    )
  })

/**
 * Queue uploaded file for processing
 */
export const queueForProcessingAction = createServerAction()
  .input(
    z.object({
      key: z.string().min(1, 'R2 key is required'),
      language: z.string().min(1, 'Language is required'),
    }),
  )
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const { key, language } = input

        // Get user session
        const session = await requireVerifiedEmail()
        const userId = session?.user?.id

        if (!userId) {
          throw new Error('User not authenticated')
        }

        try {
          // Get the audio file from R2 for transcription
          const { getFromR2 } = await import('@/utils/r2')
          const r2Object = await getFromR2(key)

          if (!r2Object) {
            throw new Error('Audio file not found in R2 storage')
          }

          // Convert R2 object to blob
          const audioBlob = await r2Object.blob()
          const fileName = r2Object.customMetadata?.originalName || 'audio.wav'

          // Create transcription record
          const transcriptionRecord = await createTranscriptionRecord({
            userId,
            r2Key: key,
            fileName,
            fileSize: r2Object.size,
            language,
          })

          try {
            // Call real STT API
            const transcriptionText = await transcribeAudio(
              audioBlob,
              language,
              fileName,
            )

            // Update transcription record with success
            await updateTranscriptionRecord(transcriptionRecord.id, {
              status: 'completed',
              transcriptionText,
              processedAt: new Date(),
            })

            return {
              success: true,
              data: {
                transcription: transcriptionText,
                key,
                language,
                fileName,
                fileSize: r2Object.size,
                transcriptionId: transcriptionRecord.id,
                processed: true,
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
          console.error('Queue processing error:', error)
          throw new ZSAError(
            'INTERNAL_SERVER_ERROR',
            error instanceof Error
              ? error.message
              : 'Failed to queue file for processing. Please try again.',
          )
        }
      },
      {
        identifier: 'stt-queue-processing',
        limit: 10, // 10 requests per window
        windowInSeconds: 60, // 1 minute window
      },
    )
  })
