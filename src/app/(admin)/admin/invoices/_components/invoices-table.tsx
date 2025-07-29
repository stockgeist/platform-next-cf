'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/data-table'
import { columns } from './columns'
import { getInvoicesAction } from '../../_actions/get-invoices.action'
import { useServerAction } from 'zsa-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PAGE_SIZE_OPTIONS } from '../../admin-constants'

export function InvoicesTable() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [emailFilter, setEmailFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const {
    execute: fetchInvoices,
    data,
    error,
    status,
  } = useServerAction(getInvoicesAction, {
    onError: () => {
      toast.error('Failed to fetch invoices')
    },
  })

  useEffect(() => {
    const statusFilterValue = statusFilter === 'all' ? '' : statusFilter
    fetchInvoices({
      page,
      pageSize,
      emailFilter,
      statusFilter: statusFilterValue,
    })
  }, [fetchInvoices, page, pageSize, emailFilter, statusFilter])

  const handlePageChange = (newPage: number) => {
    setPage(newPage + 1) // Convert from 0-based to 1-based
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <div className="flex gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Filter by email..."
            type="search"
            value={emailFilter}
            onChange={(event) => setEmailFilter(event.target.value)}
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="mt-8">
        <div className="space-y-4">
          {status === 'pending' || status === 'idle' ? (
            <div>Loading...</div>
          ) : error ? (
            <div>Error: Failed to fetch invoices</div>
          ) : !data ? (
            <div>No invoices found</div>
          ) : (
            <DataTable
              columns={columns}
              data={data.invoices}
              pageCount={data.totalPages}
              pageIndex={page - 1}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={setPageSize}
              totalCount={data.totalCount}
              itemNameSingular="invoice"
              itemNamePlural="invoices"
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </div>
      </div>
    </div>
  )
}
