import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedEmail } from '@/utils/auth'
import { streamFileFromR2, deleteFromR2 } from '@/utils/r2'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    // Require authentication
    const session = await requireVerifiedEmail()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params
    const decodedFileId = decodeURIComponent(fileId)
    const { searchParams } = new URL(request.url)
    const download = searchParams.get('download') === 'true'

    // Verify the file key belongs to the user (user-scoped key format: userId/fileId)
    if (!decodedFileId.startsWith(`${session.user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      // Stream file from R2
      const fileStream = await streamFileFromR2(decodedFileId)

      // Use original filename from metadata or fallback to key-based name
      const fileName =
        fileStream.originalFilename || decodedFileId.split('/').pop() || 'file'

      // Prepare headers based on usage
      const headers: Record<string, string> = {
        'Content-Type': fileStream.contentType,
        'Content-Length': fileStream.contentLength.toString(),
        'Cache-Control': 'private, max-age=3600',
        ...(fileStream.lastModified && {
          'Last-Modified': fileStream.lastModified.toUTCString(),
        }),
      }

      // Add Content-Disposition only for downloads
      if (download) {
        // Properly encode filename for Content-Disposition header
        const encodedFileName = encodeURIComponent(fileName)
        headers['Content-Disposition'] =
          `attachment; filename*=UTF-8''${encodedFileName}`
      }

      // Return file with proper headers
      // Handle binary data properly by creating a new ReadableStream
      const response = new Response(fileStream.body, { headers })
      return response
    } catch (streamError) {
      console.error('File streaming error:', streamError)
      return NextResponse.json(
        { error: 'Failed to retrieve file' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('File retrieval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  try {
    // Require authentication
    const session = await requireVerifiedEmail()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileId } = await params
    const decodedFileId = decodeURIComponent(fileId)

    // Verify the file key belongs to the user (user-scoped key format: userId/fileId)
    if (!decodedFileId.startsWith(`${session.user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from R2
    await deleteFromR2(decodedFileId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('File deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 },
    )
  }
}
