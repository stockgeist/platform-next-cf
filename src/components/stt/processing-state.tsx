'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, X } from 'lucide-react'

interface ProcessingStateProps {
  message: string
  onCancel: () => void
  cancelText: string
}

export function ProcessingState({
  message,
  onCancel,
  cancelText,
}: ProcessingStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-lg font-medium">{message}</span>
        </div>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="mr-2 h-4 w-4" />
          {cancelText}
        </Button>
      </CardContent>
    </Card>
  )
}
