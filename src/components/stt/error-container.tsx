'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export interface ErrorState {
  message: string
}

interface ErrorContainerProps {
  error: ErrorState
}

export function ErrorContainer({ error }: ErrorContainerProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  )
}
