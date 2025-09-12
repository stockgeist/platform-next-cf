# R2 Setup Guide

This guide explains how to set up Cloudflare R2 with proper presigned URLs using the AWS SDK.

## Environment Variables

You need to set the following environment variables for R2 to work with presigned URLs:

```bash
# Cloudflare Account ID (found in your Cloudflare dashboard)
CLOUDFLARE_ACCOUNT_ID=your_account_id_here

# R2 API Token credentials
R2_ACCESS_KEY_ID=your_access_key_id_here
R2_SECRET_ACCESS_KEY=your_secret_access_key_here
```

## Getting R2 Credentials

1. **Get your Account ID:**
   - Go to your Cloudflare dashboard
   - The Account ID is shown in the right sidebar

2. **Create R2 API Token:**
   - Go to "My Profile" → "API Tokens"
   - Click "Create Token"
   - Use "Custom token" template
   - Set permissions:
     - Account: `Cloudflare R2:Edit`
     - Zone Resources: `Include - All zones` (or specific zones)
   - Set Account Resources: `Include - All accounts` (or specific account)
   - Click "Continue to summary" and "Create Token"

3. **Get R2 Access Keys:**
   - Go to R2 → "Manage R2 API tokens"
   - Click "Create API token"
   - Set permissions: `Object Read & Write`
   - Copy the Access Key ID and Secret Access Key

## Installation

Make sure you have the AWS SDK packages installed:

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## Usage Examples

### 1. Generate Presigned Upload URL

```typescript
import { generatePresignedUploadUrl } from '@/lib/r2-client'

const uploadUrl = await generatePresignedUploadUrl(
  'audio-file.wav',
  'audio/wav',
  600 // 10 minutes expiration
)
```

### 2. Generate Presigned Download URL

```typescript
import { generatePresignedDownloadUrl } from '@/lib/r2-client'

const downloadUrl = await generatePresignedDownloadUrl(
  'stt/1234567890-abc123.wav',
  3600 // 1 hour expiration
)
```

### 3. Direct Upload to R2

```typescript
import { uploadToR2Direct } from '@/lib/r2-client'

await uploadToR2Direct(
  'stt/1234567890-abc123.wav',
  fileBuffer,
  'audio/wav',
  { originalName: 'my-audio.wav' }
)
```

### 4. API Route Example

```typescript
// app/api/r2/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl } from '@/lib/r2-client'

export async function POST(request: NextRequest) {
  const { filename, contentType } = await request.json()

  const uploadUrl = await generatePresignedUploadUrl(
    filename,
    contentType,
    600
  )

  return NextResponse.json({ uploadUrl })
}
```

## Frontend Usage

```typescript
// Get presigned URL from your API
const response = await fetch('/api/r2/presigned-url', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'audio.wav',
    contentType: 'audio/wav'
  })
})

const { data } = await response.json()

// Upload directly to R2
const uploadResponse = await fetch(data.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: {
    'Content-Type': data.contentType
  }
})
```

## Security Notes

- Presigned URLs expire after the specified time (default: 10 minutes for uploads, 1 hour for downloads)
- Always validate file types and sizes on the server before generating presigned URLs
- Use authentication middleware to ensure only authorized users can generate presigned URLs
- Consider implementing rate limiting for presigned URL generation

## Troubleshooting

1. **"R2 credentials not configured" error:**
   - Make sure all environment variables are set correctly
   - Check that the credentials have the right permissions

2. **"R2 bucket not configured" error:**
   - Ensure the R2 bucket binding is configured in `wrangler.jsonc`
   - Check that the bucket name matches your actual R2 bucket

3. **"Access Denied" errors:**
   - Verify your R2 API token has the correct permissions
   - Check that the bucket name in the code matches your actual bucket


