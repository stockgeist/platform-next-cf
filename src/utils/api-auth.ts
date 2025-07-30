import 'server-only'
import { headers } from 'next/headers'
import { validateApiKey, updateApiKeyLastUsed } from './api-key'
import { consumeCredits } from './credits'

import { withRateLimit, RATE_LIMITS } from './with-rate-limit'

export interface ApiAuthResult {
  success: boolean
  userId?: string
  apiKeyId?: string
  error?: string
  statusCode?: number
}

export async function authenticateApiRequest(): Promise<ApiAuthResult> {
  try {
    const headersList = await headers()
    const authorization = headersList.get('authorization')

    if (!authorization) {
      return {
        success: false,
        error: 'Missing Authorization header',
        statusCode: 401,
      }
    }

    // Extract API key from Bearer token
    const token = authorization.replace(/^Bearer\s+/i, '')

    if (!token) {
      return {
        success: false,
        error: 'Invalid Authorization header format',
        statusCode: 401,
      }
    }

    // Validate the API key
    const validation = await validateApiKey(token)

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid or expired API key',
        statusCode: 401,
      }
    }

    // Update last used timestamp
    if (validation.apiKeyId) {
      await updateApiKeyLastUsed(validation.apiKeyId)
    }

    return {
      success: true,
      userId: validation.userId,
      apiKeyId: validation.apiKeyId,
    }
  } catch (error) {
    console.error('API authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed',
      statusCode: 500,
    }
  }
}

export interface CreditDeductionResult {
  success: boolean
  remainingCredits?: number
  transactionId?: string
  error?: string
  statusCode?: number
}

export async function deductCreditsFromApiKey({
  userId,
  amount,
  description,
  service,
}: {
  userId: string
  amount: number
  description: string
  service: string
}): Promise<CreditDeductionResult> {
  return withRateLimit(async () => {
    try {
      if (amount <= 0) {
        return {
          success: false,
          error: 'Amount must be greater than 0',
          statusCode: 400,
        }
      }

      // Consume credits using the existing utility
      const remainingCredits = await consumeCredits({
        userId,
        amount,
        description: `API ${service}: ${description}`,
      })

      return {
        success: true,
        remainingCredits,
        transactionId: `api_${Date.now()}`, // Simple transaction ID for API calls
      }
    } catch (error) {
      console.error('Credit deduction error:', error)

      if (error instanceof Error && error.message === 'Insufficient credits') {
        return {
          success: false,
          error: 'Insufficient credits',
          statusCode: 402,
        }
      }

      return {
        success: false,
        error: 'Failed to process credit deduction',
        statusCode: 500,
      }
    }
  }, RATE_LIMITS.API_CREDIT_DEDUCTION)
}

// Rate limit configuration for API credit deduction
export const API_RATE_LIMITS = {
  CREDIT_DEDUCTION: {
    identifier: 'api-credit-deduction',
    limit: 100,
    windowInSeconds: 60, // 1 minute
  },
} as const
