'use client'

import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

export interface Column<T> {
  key:      string
  header:   string
  width?:   string
  align?:   'left' | 'center' | 'right'
  render:   (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns:      Column<T>[]
  data:         T[]
  onRowClick?:  (row: T) => void
  emptyState?:  ReactNode
  className?:   string
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div>{emptyState}</div>
  }

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  width:           col.width,
                  padding:         '10px 14px',
                  textAlign:       col.align ?? 'left',
                  fontSize:        '0.6875rem',
                  fontWeight:      600,
                  color:           'var(--color-text-muted)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  letterSpacing:   '0.04em',
                  textTransform:   'uppercase',
                  whiteSpace:      'nowrap',
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id}
              onClick={() => onRowClick?.(row)}
              style={{
                borderBottom:    idx < data.length - 1 ? '1px solid var(--color-border)' : undefined,
                cursor:          onRowClick ? 'pointer' : undefined,
                backgroundColor: 'var(--color-surface)',
                transition:      'background-color 0.1s',
              }}
              onMouseEnter={(e) => {
                if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-surface-subtle)'
              }}
              onMouseLeave={(e) => {
                if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--color-surface)'
              }}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding:       '10px 14px',
                    color:         'var(--color-text-secondary)',
                    fontSize:      '0.8125rem',
                    verticalAlign: 'middle',
                    textAlign:     col.align ?? 'left',
                  }}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
