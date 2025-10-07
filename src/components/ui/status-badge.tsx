import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusType = 'completed' | 'processing' | 'failed' | 'pending' | 'cancelled'

interface StatusBadgeProps {
  status: StatusType | string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800',
          label: 'Completed',
        }
      case 'processing':
        return {
          variant: 'secondary' as const,
          className: 'bg-yellow-100 text-yellow-800',
          label: 'Processing',
        }
      case 'failed':
        return {
          variant: 'destructive' as const,
          className: '',
          label: 'Failed',
        }
      case 'pending':
        return {
          variant: 'outline' as const,
          className: 'bg-blue-100 text-blue-800',
          label: 'Pending',
        }
      case 'cancelled':
        return {
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-800',
          label: 'Cancelled',
        }
      default:
        return {
          variant: 'outline' as const,
          className: '',
          label: 'Unknown',
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}

