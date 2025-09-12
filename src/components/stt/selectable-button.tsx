'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SelectableButtonProps {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  className?: string
}

export function SelectableButton({
  selected,
  onClick,
  children,
  className,
}: SelectableButtonProps) {
  return (
    <Button
      variant={selected ? 'default' : 'outline'}
      onClick={onClick}
      className={cn(
        'w-full justify-start',
        selected && 'bg-primary text-primary-foreground',
        className,
      )}
    >
      {children}
    </Button>
  )
}
