import { cn } from '@/lib/utils/cn'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import type { CSSProperties, ReactNode } from 'react'

export interface Column<T> {
  key:     string
  header:  string
  width?:  string
  align?:  'left' | 'center' | 'right'
  render:  (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns:           Column<T>[]
  data:              T[]
  emptyState?:       ReactNode
  className?:        string
  /** Subtle row hover when rows contain in-cell links (default true). */
  interactiveRows?: boolean
  /** Per-row layout accents (e.g. overdue / blocked inset border). */
  getRowStyle?:      (row: T, index: number) => CSSProperties | undefined
}

/**
 * DataTable — shared list table shell (server-compatible).
 * Define columns in the parent page; keep business-specific rendering there.
 */
export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyState,
  className,
  interactiveRows = true,
  getRowStyle,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>
  }

  return (
    <Table className={cn(className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead
              key={col.key}
              className="bg-[var(--color-surface-subtle)] whitespace-nowrap"
              style={{
                width:     col.width,
                textAlign: col.align ?? 'left',
              }}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, idx) => (
          <TableRow
            key={row.id}
            className={cn(!interactiveRows && 'hover:bg-transparent')}
            style={getRowStyle?.(row, idx)}
          >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                className="text-[var(--color-text-secondary)]"
                style={{ textAlign: col.align ?? 'left' }}
              >
                {col.render(row)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
