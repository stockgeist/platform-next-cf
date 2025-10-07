import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TableSkeletonProps {
  columns: {
    name: string
    width?: string
    align?: 'left' | 'center' | 'right'
  }[]
  rows?: number
  showSearch?: boolean
  showHeader?: boolean
  searchPlaceholder?: string
  headerTitle?: string
  actionButtonCount?: number
}

export function TableSkeleton({
  columns,
  rows = 3,
  showSearch = true,
  showHeader = true,
  searchPlaceholder = 'Search...',
  headerTitle = 'History',
  actionButtonCount = 2,
}: TableSkeletonProps) {
  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="flex items-center space-x-2">
          <div className="relative max-w-sm flex-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      )}

      {showHeader && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16" />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
              >
                {column.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              {columns.map((column, colIndex) => (
                <TableCell
                  key={colIndex}
                  className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                >
                  {colIndex === columns.length - 1 && column.name === 'Actions' ? (
                    <div className="flex items-center justify-end space-x-2">
                      {Array.from({ length: actionButtonCount }).map((_, btnIndex) => (
                        <Skeleton key={btnIndex} className="h-8 w-8" />
                      ))}
                    </div>
                  ) : (
                    <Skeleton
                      className={`h-4 ${column.width || 'w-24'}`}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
