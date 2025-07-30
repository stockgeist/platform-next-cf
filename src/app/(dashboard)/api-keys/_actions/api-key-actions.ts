'use server'

import { z } from 'zod'
import { actionClient } from '@/lib/safe-action'
import { requireVerifiedEmail } from '@/utils/auth'
import { withRateLimit, RATE_LIMITS } from '@/utils/with-rate-limit'
import {
  createApiKey,
  getUserApiKeys,
  deactivateApiKey,
  getApiKeyUsageStats,
} from '@/utils/api-key'
import { revalidatePath } from 'next/cache'

const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  expiresAt: z.string().optional(), // ISO date string
})

export const createApiKeyAction = actionClient
  .inputSchema(createApiKeySchema)
  .action(async ({ parsedInput }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail()

      if (!session?.user?.id) {
        throw new Error('Unauthorized')
      }

      try {
        const expiresAt = parsedInput.expiresAt
          ? new Date(parsedInput.expiresAt)
          : undefined

        const { apiKey, apiKeyRecord } = await createApiKey({
          userId: session.user.id,
          name: parsedInput.name,
          expiresAt,
        })

        revalidatePath('/api-keys')

        return {
          success: true,
          apiKey, // Only returned once
          apiKeyRecord: {
            id: apiKeyRecord.id,
            name: apiKeyRecord.name,
            prefix: apiKeyRecord.prefix,
            isActive: apiKeyRecord.isActive,
            createdAt: apiKeyRecord.createdAt,
            expiresAt: apiKeyRecord.expiresAt,
          },
        }
      } catch (error) {
        console.error('Create API key error:', error)
        throw new Error('Failed to create API key')
      }
    }, RATE_LIMITS.SETTINGS)
  })

export const getApiKeysAction = actionClient.action(async () => {
  return withRateLimit(async () => {
    const session = await requireVerifiedEmail()

    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }

    try {
      const apiKeys = await getUserApiKeys(session.user.id)
      const stats = await getApiKeyUsageStats(session.user.id)

      return {
        success: true,
        apiKeys: apiKeys.map((key) => ({
          id: key.id,
          name: key.name,
          prefix: key.prefix,
          isActive: key.isActive,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          expiresAt: key.expiresAt,
        })),
        stats,
      }
    } catch (error) {
      console.error('Get API keys error:', error)
      throw new Error('Failed to get API keys')
    }
  }, RATE_LIMITS.SETTINGS)
})

const deactivateApiKeySchema = z.object({
  apiKeyId: z.string(),
})

export const deactivateApiKeyAction = actionClient
  .inputSchema(deactivateApiKeySchema)
  .action(async ({ parsedInput }) => {
    return withRateLimit(async () => {
      const session = await requireVerifiedEmail()

      if (!session?.user?.id) {
        throw new Error('Unauthorized')
      }

      try {
        await deactivateApiKey({
          apiKeyId: parsedInput.apiKeyId,
          userId: session.user.id,
        })

        revalidatePath('/api-keys')
        return { success: true }
      } catch (error) {
        console.error('Deactivate API key error:', error)
        throw new Error('Failed to deactivate API key')
      }
    }, RATE_LIMITS.SETTINGS)
  })
