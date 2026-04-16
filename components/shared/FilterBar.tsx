import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface FilterBarProps {
  children:   ReactNode
  className?: string
}

/**
 * FilterBar — wraps filter controls (search, selects, submit, clear) in a
 * visually contained row. Sits between the PageHeader and the data table.
 */
export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label="Filters"
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        borderRadius:    'var(--radius-control)',
        padding:         '10px 14px',
        marginBottom:    '16px',
      }}
    >
      {children}
    </div>
  )
}
