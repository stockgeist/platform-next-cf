'use client'

import { useState } from 'react'
import { useOptimisticAction } from 'next-safe-action/hooks'
import { createApiKeyAction } from '../_actions/api-key-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'

export function CreateApiKeyButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)
  const [hasCopied, setHasCopied] = useState(false)

  const { execute, isPending } = useOptimisticAction(createApiKeyAction, {
    currentState: { apiKeys: [] },
    updateFn: (state) => {
      // For now, we'll just refresh the page after creation
      // In a more complex setup, you could add the new key to the list
      return state
    },
    onSuccess: (result) => {
      if (result?.data?.apiKey) {
        setCreatedApiKey(result.data.apiKey)
        toast.success('API key created successfully')
      }
    },
    onError: (result) => {
      if (result.error.validationErrors) {
        toast.error('Invalid input data')
      } else if (result.error.serverError) {
        toast.error('Server error occurred')
      } else {
        toast.error('Failed to create API key')
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    execute({ name: name.trim() })
  }

  const copyApiKey = async () => {
    if (!createdApiKey) return

    try {
      await navigator.clipboard.writeText(createdApiKey)
      setHasCopied(true)
      toast.success('API key copied to clipboard')
      setTimeout(() => setHasCopied(false), 2000)
    } catch {
      toast.error('Failed to copy API key')
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setName('')
    setCreatedApiKey(null)
    setHasCopied(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          {isPending ? 'Creating...' : 'Create API Key'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create API Key</DialogTitle>
          <DialogDescription>
            Create a new API key to access our services programmatically.
          </DialogDescription>
        </DialogHeader>

        {!createdApiKey ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Production API Key"
                required
                disabled={isPending}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || !name.trim()}>
                {isPending ? 'Creating...' : 'Create API Key'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>API Key</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={createdApiKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyApiKey}
                  className="shrink-0"
                >
                  {hasCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-muted-foreground text-sm">
                Make sure to copy your API key now. You won&apos;t be able to
                see it again!
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} disabled={isPending}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
