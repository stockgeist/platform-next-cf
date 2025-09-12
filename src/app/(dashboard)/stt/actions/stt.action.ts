'use server'

import { createServerAction } from 'zsa'
import { sttTranscribeSchema } from '@/schemas/stt.schema'
import { withRateLimit } from '@/utils/with-rate-limit'
import { getFromR2 } from '@/utils/r2'

async function transcribeAudio(
  audioBlob: Blob,
  language: string,
  fileName: string,
): Promise<string> {
  // This is a mock implementation
  // In a real implementation, you would:
  // 1. Send the audio blob to your STT service (OpenAI Whisper, Google Speech-to-Text, etc.)
  // 2. Process the audio and get the transcription
  // 3. Return the transcribed text

  // For now, we'll simulate a delay and return mock text
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return `Mock transcription for ${language} audio file: "${fileName}"`
}

export const transcribeAudioAction = createServerAction()
  .input(sttTranscribeSchema)
  .handler(async ({ input }) => {
    const { r2Key, language } = input

    // Validate language
    const supportedLanguages = [
      'en',
      'es',
      'fr',
      'de',
      'it',
      'pt',
      'ru',
      'ja',
      'ko',
      'zh',
    ]
    if (!supportedLanguages.includes(language)) {
      throw new Error(`Unsupported language: ${language}`)
    }

    try {
      // Get the audio file from R2
      const r2Object = await getFromR2(r2Key)
      if (!r2Object) {
        throw new Error('Audio file not found in storage')
      }

      // Convert R2 object to blob
      const audioBlob = await r2Object.blob()
      const fileName = r2Object.customMetadata?.originalName || 'audio.wav'

      // Transcribe the audio
      const transcription = await transcribeAudio(audioBlob, language, fileName)

      return {
        success: true,
        data: {
          text: transcription,
          language,
          fileName,
          fileSize: r2Object.size,
          r2Key,
        },
      }
    } catch (error) {
      console.error('STT transcription error:', error)
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to transcribe audio. Please try again.',
      )
    }
  })

// Rate-limited version of the action
export const transcribeAudioActionRateLimited = createServerAction()
  .input(sttTranscribeSchema)
  .handler(async ({ input }) => {
    return withRateLimit(
      async () => {
        const { r2Key, language } = input

        // Validate language
        const supportedLanguages = [
          'en',
          'es',
          'fr',
          'de',
          'it',
          'pt',
          'ru',
          'ja',
          'ko',
          'zh',
        ]
        if (!supportedLanguages.includes(language)) {
          throw new Error(`Unsupported language: ${language}`)
        }

        try {
          // Get the audio file from R2
          const r2Object = await getFromR2(r2Key)
          if (!r2Object) {
            throw new Error('Audio file not found in storage')
          }

          // Convert R2 object to blob
          const audioBlob = await r2Object.blob()
          const fileName = r2Object.customMetadata?.originalName || 'audio.wav'

          // Transcribe the audio
          const transcription = await transcribeAudio(
            audioBlob,
            language,
            fileName,
          )

          return {
            success: true,
            data: {
              text: transcription,
              language,
              fileName,
              fileSize: r2Object.size,
              r2Key,
            },
          }
        } catch (error) {
          console.error('STT transcription error:', error)
          throw new Error(
            error instanceof Error
              ? error.message
              : 'Failed to transcribe audio. Please try again.',
          )
        }
      },
      {
        identifier: 'stt-transcription',
        limit: 10, // 10 requests per window
        windowInSeconds: 60, // 1 minute window
      },
    )
  })
