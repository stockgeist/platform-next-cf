import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import {
  createTranscriptionRecord,
  updateTranscriptionRecord,
} from '@/server/transcriptions'
import { Env } from '.'

interface AudioUploadMessage {
  bucket: string
  key: string
  language: string
  userId?: string
  metadata?: {
    originalName: string
    uploadedAt: string
  }
}

interface TranscriptionResult {
  success: boolean
  text?: string
  error?: string
  processedAt: string
  language: string
  fileName: string
  fileSize: number
  transcriptionId?: string
}

/**
 * Mock STT service - replace with actual STT API integration
 */
async function transcribeAudio(
  audioBuffer: ArrayBuffer,
  language: string,
  fileName: string,
): Promise<string> {
  // This is a mock implementation
  // In a real implementation, you would:
  // 1. Send the audio buffer to your STT service (OpenAI Whisper, Google Speech-to-Text, etc.)
  // 2. Process the audio and get the transcription
  // 3. Return the transcribed text

  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 2000))

  return `Mock transcription for ${language} audio file: "${fileName}"`
}

/**
 * Process audio file from R2 and transcribe it
 */
export async function processAudioUpload(
  message: AudioUploadMessage,
): Promise<TranscriptionResult> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const { key, language, metadata, userId } = message
  const fileName = metadata?.originalName || 'audio.wav'

  let transcriptionId: string | undefined

  try {
    // Get the audio file from R2
    const r2Object = await env.R2_BUCKET.get(key)
    if (!r2Object) {
      throw new Error('Audio file not found in R2 storage')
    }

    // Create transcription record in D1
    if (userId) {
      const transcription = await createTranscriptionRecord({
        userId,
        r2Key: key,
        fileName,
        fileSize: r2Object.size,
        language,
        // metadata: {
        //   ...metadata,
        //   bucket: message.bucket,
        // },
      })
      transcriptionId = transcription.id
    }

    // Convert to ArrayBuffer for processing
    const audioBuffer = await r2Object.arrayBuffer()

    // Transcribe the audio
    const transcriptionText = await transcribeAudio(
      audioBuffer,
      language,
      fileName,
    )

    const result: TranscriptionResult = {
      success: true,
      text: transcriptionText,
      processedAt: new Date().toISOString(),
      language,
      fileName,
      fileSize: r2Object.size,
      transcriptionId,
    }

    // Update transcription record in D1
    if (transcriptionId) {
      await updateTranscriptionRecord(transcriptionId, {
        status: 'completed',
        transcriptionText,
        processedAt: new Date(),
      })
    }

    // Also store in KV for backward compatibility
    const resultKey = `stt:result:${key}`
    if (env.NEXT_INC_CACHE_KV) {
      await env.NEXT_INC_CACHE_KV.put(resultKey, JSON.stringify(result), {
        expirationTtl: 24 * 60 * 60, // 24 hours
      })
    }

    return result
  } catch (error) {
    console.error('STT processing error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'
    const errorResult: TranscriptionResult = {
      success: false,
      error: errorMessage,
      processedAt: new Date().toISOString(),
      language,
      fileName,
      fileSize: 0,
      transcriptionId,
    }

    // Update transcription record in D1 with error
    if (transcriptionId) {
      await updateTranscriptionRecord(transcriptionId, {
        status: 'failed',
        errorMessage,
        processedAt: new Date(),
      })
    }

    // Store the error result in KV for backward compatibility
    const resultKey = `stt:result:${key}`
    if (env.NEXT_INC_CACHE_KV) {
      await env.NEXT_INC_CACHE_KV.put(resultKey, JSON.stringify(errorResult), {
        expirationTtl: 24 * 60 * 60, // 24 hours
      })
    }

    return errorResult
  }
}

/**
 * Queue consumer handler for processing audio uploads
 */
export async function handleAudioUploadQueue(
  messages: MessageBatch<AudioUploadMessage>,
  env: Env,
): Promise<void> {
  if (!env?.AUDIO_UPLOADS_QUEUE) {
    throw new Error('Audio uploads queue not configured')
  }

  for (const message of messages.messages) {
    try {
      console.log('Processing audio upload:', message.body)

      const result = await processAudioUpload(message.body)

      if (result.success) {
        console.log('Transcription completed successfully:', result.text)
      } else {
        console.error('Transcription failed:', result.error)
      }

      // Acknowledge the message
      message.ack()
    } catch (error) {
      console.error('Failed to process audio upload:', error)

      // Retry the message (it will be retried automatically by Cloudflare)
      message.retry()
    }
  }
}
