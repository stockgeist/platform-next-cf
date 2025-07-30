import 'server-only'
import { randomBytes, createHash } from 'crypto'
import { eq, and, desc } from 'drizzle-orm'
import { getDB } from '@/db'
import { apiKeyTable } from '@/db/schema'
import type { ApiKey } from '@/db/schema'

// API key generation and validation utilities
export function generateApiKey(): string {
  // Generate a secure random API key (32 characters)
  return randomBytes(24).toString('base64url')
}

export function hashApiKey(apiKey: string): string {
  // Hash the API key for secure storage
  return createHash('sha256').update(apiKey).digest('hex')
}

export function getApiKeyPrefix(apiKey: string): string {
  // Get the first 8 characters for display purposes
  return apiKey.substring(0, 8)
}

export async function validateApiKey(apiKey: string): Promise<{
  isValid: boolean
  userId?: string
  apiKeyId?: string
}> {
  const db = getDB()
  const keyHash = hashApiKey(apiKey)

  const apiKeyRecord = await db.query.apiKeyTable.findFirst({
    where: and(
      eq(apiKeyTable.keyHash, keyHash),
      eq(apiKeyTable.isActive, true),
    ),
    columns: {
      id: true,
      userId: true,
      expiresAt: true,
    },
  })

  if (!apiKeyRecord) {
    return { isValid: false }
  }

  // Check if API key has expired
  if (apiKeyRecord.expiresAt && new Date() > new Date(apiKeyRecord.expiresAt)) {
    return { isValid: false }
  }

  return {
    isValid: true,
    userId: apiKeyRecord.userId,
    apiKeyId: apiKeyRecord.id,
  }
}

export async function createApiKey({
  userId,
  name,
  expiresAt,
}: {
  userId: string
  name: string
  expiresAt?: Date
}): Promise<{ apiKey: string; apiKeyRecord: ApiKey }> {
  const db = getDB()

  const apiKey = generateApiKey()
  const keyHash = hashApiKey(apiKey)
  const prefix = getApiKeyPrefix(apiKey)

  const [apiKeyRecord] = await db
    .insert(apiKeyTable)
    .values({
      userId,
      name,
      keyHash,
      prefix,
      isActive: true,
      expiresAt,
    })
    .returning()

  return { apiKey, apiKeyRecord }
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const db = getDB()

  return await db.query.apiKeyTable.findMany({
    where: eq(apiKeyTable.userId, userId),
    orderBy: [desc(apiKeyTable.createdAt)],
  })
}

export async function deactivateApiKey({
  apiKeyId,
  userId,
}: {
  apiKeyId: string
  userId: string
}): Promise<void> {
  const db = getDB()

  // First, verify the API key exists and belongs to the user
  const existingKey = await db.query.apiKeyTable.findFirst({
    where: and(eq(apiKeyTable.id, apiKeyId), eq(apiKeyTable.userId, userId)),
    columns: {
      id: true,
      isActive: true,
    },
  })

  if (!existingKey) {
    throw new Error('API key not found or does not belong to user')
  }

  if (!existingKey.isActive) {
    throw new Error('API key is already inactive')
  }

  // Update the API key
  await db
    .update(apiKeyTable)
    .set({ isActive: false })
    .where(and(eq(apiKeyTable.id, apiKeyId), eq(apiKeyTable.userId, userId)))
}

export async function updateApiKeyLastUsed(apiKeyId: string): Promise<void> {
  const db = getDB()

  await db
    .update(apiKeyTable)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeyTable.id, apiKeyId))
}

export async function getApiKeyUsageStats(userId: string): Promise<{
  totalKeys: number
  activeKeys: number
  totalUsage: number
}> {
  const db = getDB()

  const apiKeys = await db.query.apiKeyTable.findMany({
    where: eq(apiKeyTable.userId, userId),
    columns: {
      isActive: true,
      lastUsedAt: true,
    },
  })

  const totalKeys = apiKeys.length
  const activeKeys = apiKeys.filter((key) => key.isActive).length
  const totalUsage = apiKeys.filter((key) => key.lastUsedAt).length

  return {
    totalKeys,
    activeKeys,
    totalUsage,
  }
}
