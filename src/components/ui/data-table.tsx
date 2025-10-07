'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search } from 'lucide-react'
import { ReactNode, useMemo, useState } from 'react'

export interface DataTableColumn<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  className?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  searchFields?: (keyof T)[]
  searchPlaceholder?: string
  emptyMessage?: string
  headerTitle?: string
  actionButton?: ReactNode
  className?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchFields = [],
  searchPlaceholder = 'Search...',
  emptyMessage = 'No data found.',
  headerTitle,
  actionButton,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchFields.length === 0) {
      return data
    }

    return data.filter((item) =>
      searchFields.some((field) => {
        const value = item[field]
        return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, searchFields])

  return (
    <div className={`flex h-full flex-col space-y-4 ${className || ''}`}>
      <div className="flex w-full items-center justify-between gap-2">
        <div className="flex w-full items-center space-x-2">
          <div className="relative max-w-sm flex-1">
            <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          {searchQuery && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </Button>
          )}
        </div>
        {actionButton}
      </div>

      {headerTitle && (
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">{headerTitle}</h2>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        <div className="relative h-full overflow-auto">
          <Table noWrapper>
            <TableHeader className="bg-background sticky top-0 z-10">
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={item.id || index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {column.render ? column.render(item) : item[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
