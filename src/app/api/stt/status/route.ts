import { NextRequest, NextResponse } from 'next/server'
import { getTranscriptionByR2Key } from '@/server/transcriptions'
import { getTranscriptionResult } from '@/utils/r2'
import { requireVerifiedEmail } from '@/utils/auth'

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const session = await requireVerifiedEmail()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 },
      )
    }

    // First try to get from D1 database
    const transcription = await getTranscriptionByR2Key(key)

    if (transcription) {
      // Check if user has access to this transcription
      if (transcription.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      if (transcription.status === 'completed') {
        return NextResponse.json({
          status: 'completed',
          data: {
            text: transcription.transcriptionText,
            language: transcription.language,
            fileName: transcription.fileName,
            fileSize: transcription.fileSize,
            processedAt: transcription.processedAt,
            transcriptionId: transcription.id,
          },
        })
      } else if (transcription.status === 'failed') {
        return NextResponse.json({
          status: 'error',
          error: transcription.errorMessage,
          processedAt: transcription.processedAt,
          transcriptionId: transcription.id,
        })
      } else {
        return NextResponse.json({
          status: 'processing',
          message: 'Transcription is still being processed',
          transcriptionId: transcription.id,
        })
      }
    }

    // Fallback to KV for backward compatibility
    const result = await getTranscriptionResult(key)

    if (!result) {
      return NextResponse.json({
        status: 'processing',
        message: 'Transcription is still being processed',
      })
    }

    if (result.success) {
      return NextResponse.json({
        status: 'completed',
        data: {
          text: result.text,
          language: result.language,
          fileName: result.fileName,
          fileSize: result.fileSize,
          processedAt: result.processedAt,
        },
      })
    } else {
      return NextResponse.json({
        status: 'error',
        error: result.error,
        processedAt: result.processedAt,
      })
    }
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
