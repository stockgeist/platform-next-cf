import 'server-only'

import { getCloudflareContext } from '@opennextjs/cloudflare'
import { init } from '@paralleldrive/cuid2'
import { generatePresignedUploadUrl as generateS3PresignedUrl } from '@/lib/r2-client'

const generateId = init({
  length: 10,
})

export interface PresignedUploadResult {
  uploadUrl: string
  key: string
  fields: Record<string, string>
}

export interface R2UploadResult {
  key: string
  url: string
  size: number
  etag: string
}

export interface R2UploadOptions {
  contentType?: string
  customMetadata?: Record<string, string>
  expiresIn?: number // TTL in seconds
}

/**
 * Upload a file to R2 storage with user-scoped key
 */
export async function uploadUserScopedToR2(
  file: File | Blob,
  userId: string,
  options: R2UploadOptions = {},
): Promise<R2UploadResult> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const { contentType, customMetadata } = options

  // Generate a unique key for the file with user scoping
  const fileId = generateId()
  const fileName = file instanceof File ? file.name : 'file'
  const extension = getFileExtension(fileName)
  const key = `${userId}/${fileId}${extension}`

  // Prepare upload options
  const uploadOptions: R2PutOptions = {
    httpMetadata: {
      contentType: contentType || file.type || 'application/octet-stream',
    },
    customMetadata: {
      uploadedAt: new Date().toISOString(),
      originalName: fileName,
      userId,
      ...customMetadata,
    },
  }

  // Add expiration if specified
  if (options.expiresIn) {
    uploadOptions.httpMetadata = {
      ...uploadOptions.httpMetadata,
      cacheControl: `max-age=${options.expiresIn}`,
    }
  }

  try {
    // Upload the file to R2
    const result = await env.R2_BUCKET.put(key, file, uploadOptions)

    if (!result) {
      throw new Error('Failed to upload file to R2')
    }

    return {
      key,
      url: `/api/files/${key}`,
      size: result.size,
      etag: result.etag,
    }
  } catch (error) {
    console.error('R2 upload error:', error)
    throw new Error('Failed to upload file to R2 storage')
  }
}

/**
 * Get a file from R2 storage
 */
export async function getFromR2(key: string): Promise<R2ObjectBody | null> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  try {
    return await env.R2_BUCKET.get(key)
  } catch (error) {
    console.error('R2 get error:', error)
    throw new Error('Failed to retrieve file from R2 storage')
  }
}

/**
 * Delete a file from R2 storage
 */
export async function deleteFromR2(key: string): Promise<void> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  try {
    await env.R2_BUCKET.delete(key)
  } catch (error) {
    console.error('R2 delete error:', error)
    throw new Error('Failed to delete file from R2 storage')
  }
}

/**
 * Generate a signed URL for R2 object (for private access)
 */
export async function getSignedUrl(key: string): Promise<string> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  try {
    // Note: This is a simplified implementation
    // In production, you might want to use Cloudflare's signed URL generation
    const url = `https://pub-nlp-platform-files.r2.dev/${key}`
    return url
  } catch (error) {
    console.error('R2 signed URL error:', error)
    throw new Error('Failed to generate signed URL')
  }
}

/**
 * Helper function to get file extension
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  return lastDot !== -1 ? filename.substring(lastDot) : ''
}

/**
 * Validate file type for STT
 */

const allowedTypes = ['audio/wav', 'audio/x-wav']

const allowedExtensions = ['.wav']
export function validateAudioFile(file: File): {
  valid: boolean
  error?: string
} {
  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    // Check file extension as fallback
    const extension = getFileExtension(file.name)
    if (!allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error:
          'Invalid audio file type. Please upload a WAV, MP3, MP4, M4A, OGG, or WebM file.',
      }
    }
  }

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`,
    }
  }

  return { valid: true }
}

/**
 * Generate a presigned URL for direct client upload to R2 with user-scoped key
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  userId: string,
  language?: string,
): Promise<PresignedUploadResult> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  // Generate a unique key for the file with user scoping
  const fileId = generateId()
  const extension = getFileExtension(fileName)
  const key = `${userId}/${fileId}${extension}`

  try {
    // Generate presigned URL using AWS SDK
    const uploadUrl = await generateS3PresignedUrl(key, contentType, 600) // 10 minutes

    // Store metadata for the queue processor
    const metadata = {
      originalName: fileName,
      uploadedAt: new Date().toISOString(),
      language,
      userId,
    }

    // Store metadata in KV for the queue processor to use
    const metadataKey = `stt:metadata:${key}`
    if (env.NEXT_INC_CACHE_KV) {
      await env.NEXT_INC_CACHE_KV.put(metadataKey, JSON.stringify(metadata), {
        expirationTtl: 24 * 60 * 60, // 24 hours
      })
    }

    return {
      uploadUrl,
      key,
      fields: {
        'Content-Type': contentType,
      },
    }
  } catch (error) {
    console.error('Failed to generate presigned URL:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to generate upload URL',
    )
  }
}

/**
 * Queue an audio file for STT processing after upload
 */
export async function queueAudioForProcessing(
  key: string,
  language: string,
  userId?: string,
): Promise<void> {
  const { env } = getCloudflareContext()

  if (!env?.AUDIO_UPLOADS_QUEUE) {
    throw new Error('Audio uploads queue not configured')
  }

  // Get metadata from KV
  const metadataKey = `stt:metadata:${key}`
  if (!env.NEXT_INC_CACHE_KV) {
    throw new Error('KV store not configured')
  }

  const metadataStr = await env.NEXT_INC_CACHE_KV.get(metadataKey)

  if (!metadataStr) {
    throw new Error('Metadata not found for uploaded file')
  }

  const metadata = JSON.parse(metadataStr)

  // Send message to queue for processing
  await env.AUDIO_UPLOADS_QUEUE.send({
    bucket: 'nlp-platform-files',
    key,
    language,
    userId,
    metadata,
  })

  console.log('Queued audio file for processing:', key)
}

/**
 * Get transcription result from KV
 */
export async function getTranscriptionResult(key: string): Promise<{
  success: boolean
  text?: string
  error?: string
  processedAt?: string
  language?: string
  fileName?: string
  fileSize?: number
} | null> {
  const { env } = getCloudflareContext()

  if (!env?.NEXT_INC_CACHE_KV) {
    throw new Error('KV store not configured')
  }

  const resultKey = `stt:result:${key}`
  const resultStr = await env.NEXT_INC_CACHE_KV.get(resultKey)

  if (!resultStr) {
    return null
  }

  return JSON.parse(resultStr)
}

/**
 * Generate a signed URL for secure file access
 */
export async function generateSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600, // 1 hour default
): Promise<string> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  try {
    // Use the S3 client to generate a presigned URL
    const { generatePresignedDownloadUrl } = await import('@/lib/r2-client')
    return await generatePresignedDownloadUrl(key, expiresIn)
  } catch (error) {
    console.error('R2 signed URL error:', error)
    throw new Error('Failed to generate signed URL')
  }
}

/**
 * Stream a file from R2 with proper headers
 */
export async function streamFileFromR2(key: string): Promise<{
  body: ReadableStream
  contentType: string
  contentLength: number
  lastModified?: Date
  originalFilename?: string
}> {
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  try {
    const object = await env.R2_BUCKET.get(key)

    if (!object) {
      throw new Error('File not found')
    }

    return {
      body: object.body,
      contentType:
        object.httpMetadata?.contentType || 'application/octet-stream',
      contentLength: object.size,
      lastModified: object.uploaded,
      originalFilename: object.customMetadata?.originalName,
    }
  } catch (error) {
    console.error('R2 stream error:', error)
    throw new Error('Failed to stream file from R2 storage')
  }
}
