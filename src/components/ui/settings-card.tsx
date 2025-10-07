'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface SettingsCardProps {
  title: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function SettingsCard({ title, children, className, contentClassName }: SettingsCardProps) {
  return (
    <Card className={cn('relative h-min', className)}>
      <div className="bg-background absolute -top-3 left-4 px-2">
        <Label className="text-sm font-medium">{title}</Label>
      </div>
      <CardContent className={cn('', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}


