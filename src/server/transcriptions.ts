import 'server-only'

import { getDB } from '@/db'
import { transcriptionTable } from '@/db/schema'
import { requireVerifiedEmail } from '@/utils/auth'
import { eq, desc } from 'drizzle-orm'

export async function getUserTranscriptions() {
  const session = await requireVerifiedEmail()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const transcriptions = await db
    .select()
    .from(transcriptionTable)
    .where(eq(transcriptionTable.userId, userId))
    .orderBy(desc(transcriptionTable.createdAt))

  return transcriptions
}

export async function getTranscriptionById(id: string) {
  const session = await requireVerifiedEmail()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [transcription] = await db
    .select()
    .from(transcriptionTable)
    .where(eq(transcriptionTable.id, id))

  if (!transcription || transcription.userId !== userId) {
    throw new Error('Transcription not found')
  }

  return transcription
}

export async function getTranscriptionByR2Key(r2Key: string) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }
  const [transcription] = await db
    .select()
    .from(transcriptionTable)
    .where(eq(transcriptionTable.r2Key, r2Key))

  return transcription
}

export async function createTranscriptionRecord(data: {
  userId: string
  r2Key: string
  fileName: string
  fileSize: number
  language: string
  teamId?: string
}) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [transcriptionRecord] = await db
    .insert(transcriptionTable)
    .values({
      userId: data.userId,
      teamId: data.teamId,
      r2Key: data.r2Key,
      fileName: data.fileName,
      fileSize: data.fileSize,
      language: data.language,
      status: 'processing',
    })
    .returning()

  return transcriptionRecord
}

export async function updateTranscriptionRecord(
  id: string,
  updates: {
    status: 'completed' | 'failed'
    transcriptionText?: string
    errorMessage?: string
    processedAt?: Date
  },
) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [updatedRecord] = await db
    .update(transcriptionTable)
    .set({
      status: updates.status,
      transcriptionText: updates.transcriptionText,
      errorMessage: updates.errorMessage,
      processedAt: updates.processedAt || new Date(),
    })
    .where(eq(transcriptionTable.id, id))
    .returning()

  return updatedRecord
}

export async function deleteTranscriptionRecord(id: string, userId: string) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  // First verify the transcription belongs to the user
  const [transcription] = await db
    .select()
    .from(transcriptionTable)
    .where(eq(transcriptionTable.id, id))

  if (!transcription || transcription.userId !== userId) {
    throw new Error('Transcription not found or access denied')
  }

  await db.delete(transcriptionTable).where(eq(transcriptionTable.id, id))

  return { success: true }
}
