import { handleAudioUploadQueue } from './stt-processor'

export interface Env {
  R2_BUCKET: R2Bucket
  AUDIO_UPLOADS_QUEUE: Queue
  NEXT_INC_CACHE_KV: KVNamespace
}

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

const worker = {
  async queue(
    batch: MessageBatch<AudioUploadMessage>,
    env: Env,
  ): Promise<void> {
    await handleAudioUploadQueue(batch, env)
  },
}

export default worker
