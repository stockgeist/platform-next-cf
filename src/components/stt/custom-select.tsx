'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CustomSelectProps {
  data: Array<{ label: string; value: string }>
  label: string
  value: string | null
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function CustomSelect({
  data,
  label,
  value,
  onChange,
  disabled = false,
  placeholder = 'Select an option...',
}: CustomSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="custom-select">{label}</Label>
      <Select
        value={value || undefined}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="custom-select">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
