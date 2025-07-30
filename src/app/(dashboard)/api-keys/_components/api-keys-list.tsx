'use client'

import { useOptimisticAction } from 'next-safe-action/hooks'
import { ApiKeyItem } from './api-key-item'
import { deactivateApiKeyAction } from '../_actions/api-key-actions'
import { toast } from 'sonner'

interface ApiKey {
  id: string
  name: string
  prefix: string
  isActive: boolean
  createdAt: Date
  lastUsedAt?: Date | null
  expiresAt?: Date | null
}

interface ApiKeysListProps {
  initialApiKeys: ApiKey[]
}

/**
 * API Keys List Component
 *
 * Uses next-safe-action's useOptimisticAction for optimistic updates.
 * Each ApiKeyItem handles its own deactivation with optimistic updates.
 */
export function ApiKeysList({ initialApiKeys }: ApiKeysListProps) {
  const { execute, optimisticState } = useOptimisticAction(
    deactivateApiKeyAction,
    {
      currentState: { apiKeys: initialApiKeys },
      updateFn: (state, input) => {
        const { apiKeyId } = input as { apiKeyId: string }
        return {
          apiKeys: state.apiKeys.map((key) =>
            key.id === apiKeyId ? { ...key, isActive: false } : key,
          ),
        }
      },
      onSuccess: () => {
        toast.success('API key deactivated successfully')
      },
      onError: (result) => {
        if (result.error.validationErrors) {
          toast.error('Invalid input data')
        } else if (result.error.serverError) {
          toast.error('Server error occurred')
        } else {
          toast.error('Failed to deactivate API key')
        }
      },
    },
  )

  if (optimisticState.apiKeys.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">
          No API keys found. Create your first API key to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {optimisticState.apiKeys.map((apiKey) => (
        <ApiKeyItem
          key={apiKey.id}
          apiKey={apiKey}
          deactivateAction={(apiKeyId) => execute({ apiKeyId })}
        />
      ))}
    </div>
  )
}
