import { NextRequest } from 'next/server'
import { requireVerifiedEmail } from '@/utils/auth'
import { createTtsRecord, updateTtsRecord } from '@/server/tts'

export async function GET(request: NextRequest) {
  try {
    const session = await requireVerifiedEmail()
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text')
    const voice = searchParams.get('voice')

    if (!text || !voice) {
      return new Response('Missing text or voice parameters', { status: 400 })
    }

    // Create TTS record in database
    const ttsRecord = await createTtsRecord({
      userId: session.user.id,
      text,
      voice,
    })

    const ttsToken = process.env.TTS_TOKEN
    const ttsStreamUrl = process.env.TTS_STREAMING_URL

    if (!ttsStreamUrl || !ttsToken) {
      await updateTtsRecord(ttsRecord.id, {
        status: 'failed',
        errorMessage: 'TTS URL or token is not configured',
        processedAt: new Date(),
      })
      return new Response('TTS service not configured', { status: 500 })
    }

    // Prepare form data for the external API
    const formData = new FormData()
    formData.append('text', text)
    formData.append('language', 'lt')
    formData.append('speaker_id', voice)

    // Call the external TTS service
    const apiResponse = await fetch(ttsStreamUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ttsToken}`,
        accept: 'audio/wav',
      },
      body: formData,
    })

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text()
      await updateTtsRecord(ttsRecord.id, {
        status: 'failed',
        errorMessage: `TTS API error: ${errorText}`,
        processedAt: new Date(),
      })
      return new Response(`TTS API error: ${errorText}`, { status: 500 })
    }

    if (!apiResponse.body) {
      await updateTtsRecord(ttsRecord.id, {
        status: 'failed',
        errorMessage: 'No response body received from TTS API',
        processedAt: new Date(),
      })
      return new Response('No response body', { status: 500 })
    }

    // Create a readable stream that processes the TTS response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = apiResponse.body!.getReader()
        let totalBytes = 0
        let chunkCount = 0

        try {
          while (true) {
            const { done, value } = await reader.read()

            if (done) {
              console.log(
                `TTS streaming complete. Received ${chunkCount} chunks, total: ${totalBytes} bytes`,
              )
              break
            }

            // Forward the chunk to the client immediately
            controller.enqueue(value)
            totalBytes += value.length
            chunkCount++

            // Log progress for debugging
            if (chunkCount <= 5 || chunkCount % 10 === 0) {
              console.log(
                `Streaming chunk ${chunkCount}, size: ${value.length} bytes, total: ${totalBytes} bytes`,
              )
            }
          }

          // Update record with success
          await updateTtsRecord(ttsRecord.id, {
            status: 'completed',
            processedAt: new Date(),
          })

          controller.close()
        } catch (error) {
          console.error('Error during TTS streaming:', error)
          // Update record with failure
          await updateTtsRecord(ttsRecord.id, {
            status: 'failed',
            errorMessage:
              error instanceof Error ? error.message : 'Unknown error',
            processedAt: new Date(),
          })

          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-cache',
        'X-TTS-ID': ttsRecord.id,
        'Content-Disposition': `attachment; filename="tts-${voice}-${ttsRecord.id}.wav"`,
      },
    })
  } catch (error) {
    console.error('TTS streaming error:', error)
    return new Response('Internal server error', { status: 500 })
  }
}

// Keep the POST method for backward compatibility
export async function POST(request: NextRequest) {
  return GET(request)
}
