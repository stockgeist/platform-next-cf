'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Key, Trash2, Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ApiKey {
  id: string
  name: string
  prefix: string
  isActive: boolean
  createdAt: Date
  lastUsedAt?: Date | null
  expiresAt?: Date | null
}

interface ApiKeyItemProps {
  apiKey: ApiKey
  deactivateAction: (apiKeyId: string) => void
}

export function ApiKeyItem({ apiKey, deactivateAction }: ApiKeyItemProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDeactivate = () => {
    deactivateAction(apiKey.id)
    setIsDialogOpen(false)
  }

  const isExpired = apiKey.expiresAt && new Date() > new Date(apiKey.expiresAt)

  return (
    <Card>
      <CardContent className="">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
              <Key className="text-primary h-5 w-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{apiKey.name}</h3>
                <div className="flex items-center space-x-2">
                  {apiKey.isActive ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                  {isExpired && <Badge variant="destructive">Expired</Badge>}
                </div>
              </div>

              <div className="text-muted-foreground flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <span>Prefix:</span>
                  <code className="bg-muted rounded px-1">
                    {apiKey.prefix}...
                  </code>
                </div>

                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Created{' '}
                    {formatDistanceToNow(new Date(apiKey.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {apiKey.lastUsedAt && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      Last used{' '}
                      {formatDistanceToNow(new Date(apiKey.lastUsedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
              </div>

              {apiKey.expiresAt && (
                <div className="text-muted-foreground text-sm">
                  Expires{' '}
                  {formatDistanceToNow(new Date(apiKey.expiresAt), {
                    addSuffix: true,
                  })}
                </div>
              )}
            </div>
          </div>

          {apiKey.isActive && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Deactivate API Key</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to deactivate &quot;
                    {apiKey.name}
                    &quot;? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDeactivate}>
                    Deactivate
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
