import 'server-only'

import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getCloudflareContext } from '@opennextjs/cloudflare'

// R2 S3-compatible client configuration
let s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (s3Client) {
    return s3Client
  }

  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  // Get R2 credentials from environment
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.',
    )
  }

  s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  })

  return s3Client
}

/**
 * Generate a presigned URL for uploading to R2
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 600, // 10 minutes default
): Promise<string> {
  const client = getS3Client()
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const command = new PutObjectCommand({
    Bucket: 'nlp-platform-files', // Use the bucket name from wrangler.jsonc
    Key: key,
    ContentType: contentType,
  })

  return getSignedUrl(client, command, { expiresIn })
}

/**
 * Generate a presigned URL for downloading from R2
 */
export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600, // 1 hour default
): Promise<string> {
  const client = getS3Client()
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const command = new GetObjectCommand({
    Bucket: 'nlp-platform-files', // Use the bucket name from wrangler.jsonc
    Key: key,
  })

  return getSignedUrl(client, command, { expiresIn })
}

/**
 * Upload a file directly to R2 using the S3 client
 */
export async function uploadToR2Direct(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  metadata?: Record<string, string>,
): Promise<void> {
  const client = getS3Client()
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const command = new PutObjectCommand({
    Bucket: 'nlp-platform-files', // Use the bucket name from wrangler.jsonc
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
  })

  await client.send(command)
}

/**
 * Download a file from R2 using the S3 client
 */
export async function downloadFromR2(key: string): Promise<Buffer> {
  const client = getS3Client()
  const { env } = getCloudflareContext()

  if (!env?.R2_BUCKET) {
    throw new Error('R2 bucket not configured')
  }

  const command = new GetObjectCommand({
    Bucket: 'nlp-platform-files', // Use the bucket name from wrangler.jsonc
    Key: key,
  })

  const response = await client.send(command)

  if (!response.Body) {
    throw new Error('File not found in R2 storage')
  }

  // Convert the stream to a buffer
  const chunks: Uint8Array[] = []
  const reader = response.Body.transformToWebStream().getReader()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    chunks.push(value)
  }

  return Buffer.concat(chunks)
}
