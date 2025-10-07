import 'server-only'

import { getDB } from '@/db'
import { ttsTable } from '@/db/schema'
import { requireVerifiedEmail } from '@/utils/auth'
import { eq, desc } from 'drizzle-orm'

export async function getUserTtsHistory() {
  const session = await requireVerifiedEmail()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const ttsHistory = await db
    .select()
    .from(ttsTable)
    .where(eq(ttsTable.userId, userId))
    .orderBy(desc(ttsTable.createdAt))

  return ttsHistory
}

export async function getTtsById(id: string) {
  const session = await requireVerifiedEmail()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('User not authenticated')
  }
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [ttsRecord] = await db
    .select()
    .from(ttsTable)
    .where(eq(ttsTable.id, id))

  if (!ttsRecord || ttsRecord.userId !== userId) {
    throw new Error('TTS record not found')
  }

  return ttsRecord
}

export async function getTtsByR2Key(r2Key: string) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }
  const [ttsRecord] = await db
    .select()
    .from(ttsTable)
    .where(eq(ttsTable.r2Key, r2Key))

  return ttsRecord
}

export async function createTtsRecord(data: {
  userId: string
  text: string
  voice: string
  teamId?: string
}) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [ttsRecord] = await db
    .insert(ttsTable)
    .values({
      userId: data.userId,
      teamId: data.teamId,
      text: data.text,
      voice: data.voice,
      status: 'processing',
    })
    .returning()

  return ttsRecord
}

export async function updateTtsRecord(
  id: string,
  updates: {
    status: 'completed' | 'failed'
    r2Key?: string
    fileName?: string
    fileSize?: number
    errorMessage?: string
    processedAt?: Date
  },
) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  const [updatedRecord] = await db
    .update(ttsTable)
    .set({
      status: updates.status,
      r2Key: updates.r2Key,
      fileName: updates.fileName,
      fileSize: updates.fileSize,
      errorMessage: updates.errorMessage,
      processedAt: updates.processedAt || new Date(),
    })
    .where(eq(ttsTable.id, id))
    .returning()

  return updatedRecord
}

export async function deleteTtsRecord(id: string, userId: string) {
  const db = getDB()
  if (!db) {
    throw new Error('Database not available')
  }

  // First verify the TTS record belongs to the user
  const [ttsRecord] = await db
    .select()
    .from(ttsTable)
    .where(eq(ttsTable.id, id))

  if (!ttsRecord || ttsRecord.userId !== userId) {
    throw new Error('TTS record not found or access denied')
  }

  await db.delete(ttsTable).where(eq(ttsTable.id, id))

  return { success: true }
}
