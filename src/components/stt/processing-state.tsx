'use client'

import { Button } from '@/components/ui/button'

import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

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
    <div className="flex w-full flex-col items-center justify-center gap-8 p-8">
      <span className="text-muted-foreground">{message}</span>
      <LoadingSpinner size={110} />
      <Button variant="outline" onClick={onCancel} size="sm">
        {cancelText}
      </Button>
    </div>
  )
}
