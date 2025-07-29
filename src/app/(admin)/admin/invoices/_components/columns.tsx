'use client'

import { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, ExternalLink } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type Invoice = {
  id: number
  invoiceNumber: string
  userEmail: string | null
  userName: string | null
  packageId: string
  numberOfCredits: number
  amount: number
  vatAmount: number
  totalAmount: number
  currency: string
  status: 'paid' | 'pending' | 'failed'
  paymentIntentId: string
  vatNumber: string | null
  country: string
  isBusiness: boolean
  createdAt: Date
}

// Helper function to format currency amounts
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100) // Assuming amounts are stored in cents
}

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: 'userEmail',
    header: 'Customer',
    cell: ({ row }) => {
      const email = row.getValue('userEmail') as string
      const name = row.original.userName
      return (
        <div className="flex flex-col">
          <span className="font-medium">{email}</span>
          {name && (
            <span className="text-muted-foreground text-sm">{name}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'packageId',
    header: 'Package',
    cell: ({ row }) => {
      const packageId = row.getValue('packageId') as string
      const credits = row.original.numberOfCredits
      return (
        <div className="flex flex-col">
          <span className="font-medium">{packageId}</span>
          <span className="text-muted-foreground text-sm">
            {credits} credits
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'totalAmount',
    header: 'Total Amount',
    cell: ({ row }) => {
      const totalAmount = row.getValue('totalAmount') as number
      const currency = row.original.currency
      return (
        <span className="font-medium">
          {formatCurrency(totalAmount, currency)}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const getStatusVariant = (status: string) => {
        switch (status) {
          case 'paid':
            return 'default'
          case 'pending':
            return 'secondary'
          case 'failed':
            return 'destructive'
          default:
            return 'secondary'
        }
      }
      return (
        <Badge variant={getStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'country',
    header: 'Country',
    cell: ({ row }) => {
      const country = row.getValue('country') as string
      const isBusiness = row.original.isBusiness
      return (
        <div className="flex flex-col">
          <span className="font-medium">{country.toUpperCase()}</span>
          {isBusiness && (
            <span className="text-muted-foreground text-sm">Business</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as Date
      const formattedDate = format(new Date(date), 'PPpp')
      return (
        <Tooltip>
          <TooltipTrigger>
            {formatDistanceToNow(new Date(date), { addSuffix: true })}
          </TooltipTrigger>
          <TooltipContent>
            <p>{formattedDate}</p>
          </TooltipContent>
        </Tooltip>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const invoice = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(invoice.id.toString())
              }
            >
              Copy invoice ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(invoice.paymentIntentId)
              }
            >
              Copy payment intent ID
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(invoice.userEmail || '')
              }
            >
              Copy customer email
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // Open invoice details in new tab
                window.open(`/api/invoices/${invoice.id}`, '_blank')
              }}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Invoice
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
