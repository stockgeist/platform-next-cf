'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  label: string
  value: string
  icon?: string | ReactNode
  disabled?: boolean
  badge?: string
}

interface CustomSelectProps {
  data: SelectOption[]
  label: string
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  showIcon?: boolean
  showBadge?: boolean
  className?: string
}

export function CustomSelect({
  data,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option...',
  showIcon = true,
  showBadge = true,
  className,
}: CustomSelectProps) {
  const selectedItem = data.find((item) => item.value === value)

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="custom-select" className="text-sm font-medium">
        {label}
      </Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="custom-select">
          <div className="flex items-center gap-2">
            {showIcon && selectedItem?.icon && (
              <span className="text-lg">
                {typeof selectedItem.icon === 'string'
                  ? selectedItem.icon
                  : selectedItem.icon}
              </span>
            )}
            <span className="text-muted-foreground text-sm">
              {selectedItem?.label || placeholder}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
            >
              <div className="flex items-center gap-2">
                {showIcon && item.icon && (
                  <span className="text-lg">
                    {typeof item.icon === 'string' ? item.icon : item.icon}
                  </span>
                )}
                <span>{item.label}</span>
                {showBadge && item.badge && (
                  <span className="text-muted-foreground ml-auto text-xs">
                    {item.badge}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
