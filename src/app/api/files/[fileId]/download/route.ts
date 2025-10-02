import { NextRequest, NextResponse } from 'next/server'
import { requireVerifiedEmail } from '@/utils/auth'
import { generateSignedDownloadUrl } from '@/utils/r2'
import { z } from 'zod'

const querySchema = z.object({
  expiresIn: z.coerce.number().min(60).max(86400).default(3600), // 1 minute to 24 hours
})

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
    const { searchParams } = new URL(request.url)

    const validation = querySchema.safeParse({
      expiresIn: searchParams.get('expiresIn'),
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: validation.error.errors },
        { status: 400 },
      )
    }

    const { expiresIn } = validation.data

    // Verify the file key belongs to the user (user-scoped key format: userId/fileId)
    if (!fileId.startsWith(`${session.user.id}/`)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
      // Generate signed download URL
      const downloadUrl = await generateSignedDownloadUrl(fileId, expiresIn)

      // Extract filename from the key
      const fileName = fileId.split('/').pop() || 'file'

      return NextResponse.json({
        downloadUrl,
        expiresIn,
        fileName,
      })
    } catch (error) {
      console.error('Signed URL generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error('File download URL error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
