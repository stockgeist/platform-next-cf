'use server'

import { createServerAction, ZSAError } from 'zsa'
import { ttsGenerateSchema } from '@/schemas/tts.schema'
import { requireVerifiedEmail } from '@/utils/auth'
import { createTtsRecord, updateTtsRecord } from '@/server/tts'
import { uploadUserScopedToR2 } from '@/utils/r2'
import { revalidatePath } from 'next/cache'

/**
 * Generate TTS audio from text
 */
export const generateTtsAction = createServerAction()
  .input(ttsGenerateSchema)
  .handler(async ({ input }) => {
    try {
      const session = await requireVerifiedEmail()
      if (!session?.user?.id) {
        throw new ZSAError('NOT_AUTHORIZED', 'Authentication required')
      }

      const { text, voice } = input

      // Create TTS record in database
      const ttsRecord = await createTtsRecord({
        userId: session.user.id,
        text,
        voice,
      })

      try {
        // Call your external TTS API
        const ttsToken = process.env.TTS_TOKEN
        const ttsUrl = process.env.TTS_URL

        if (!ttsUrl || !ttsToken) {
          throw new Error('TTS URL or token is not configured')
        }

        // Prepare form data for the external API
        const formData = new FormData()
        formData.append('text', text)
        formData.append('language', 'lt')
        formData.append('speaker_id', voice)

        // Call the external TTS service
        const apiResponse = await fetch(ttsUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ttsToken}`,
            accept: 'audio/wav',
          },
          body: formData,
        })

        if (!apiResponse.ok) {
          const errorText = await apiResponse.text()
          console.error('TTS API error:', errorText)
          throw new Error(`TTS API error: ${errorText || 'Unknown error'}`)
        }

        // Get the audio data as ArrayBuffer
        const audioBuffer = await apiResponse.arrayBuffer()

        // Upload to R2
        const fileName = `tts-${voice}-${ttsRecord.id}.wav`

        const file = new File([audioBuffer], fileName, { type: 'audio/wav' })

        const { key: r2Key } = await uploadUserScopedToR2(
          file,
          session.user.id,
          {
            contentType: 'audio/wav',
            customMetadata: {
              fileName,
            },
          },
        )

        // Update record with success
        await updateTtsRecord(ttsRecord.id, {
          status: 'completed',
          r2Key,
          fileName,
          fileSize: file.size,
          processedAt: new Date(),
        })

        const audioUrl = `/api/files/${encodeURIComponent(r2Key)}`

        revalidatePath('/tts')

        return {
          success: true,
          data: {
            ttsId: ttsRecord.id,
            audioUrl,
            fileName,
            file,
          },
        }
      } catch (error) {
        // Update record with failure

        await updateTtsRecord(ttsRecord.id, {
          status: 'failed',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
          processedAt: new Date(),
        })

        revalidatePath('/tts')
        throw new ZSAError(
          'INTERNAL_SERVER_ERROR',
          'Failed to generate TTS audio',
        )
      }
    } catch (error) {
      console.error('Failed to generate TTS:', error)

      if (error instanceof ZSAError) {
        throw error
      }

      throw new ZSAError(
        'INTERNAL_SERVER_ERROR',
        'Failed to generate TTS audio',
      )
    }
  })
