import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface FilterBarProps {
  children:   ReactNode
  className?: string
}

/**
 * FilterBar — wraps filter controls (search, selects, submit, clear) in a
 * visually contained row. Sits between the PageHeader and the data table.
 * Keeps server-form GET pattern — NOT converting to client-controlled state.
 */
export function FilterBar({ children, className }: FilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filters"
      className={cn(
        'mb-4 flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2.5',
        className
      )}
    >
      {children}
    </div>
  )
}
