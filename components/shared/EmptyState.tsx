import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?:        ReactNode
  title:        string
  description?: string
  action?:      ReactNode
  /**
   * emphasis — first-use state: centered, larger icon, prominent action button.
   * Default (false) — standard empty state for lists and sections.
   * compact — filter no-results: minimal height, inline layout, no large icon block.
   */
  emphasis?:  boolean
  compact?:   boolean
  className?: string
}

export function EmptyState({ icon, title, description, action, emphasis, compact, className }: EmptyStateProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-3',
          className
        )}
      >
        {icon && (
          <span aria-hidden="true" className="flex shrink-0 text-[var(--color-text-muted)]">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-medium leading-[1.35] text-[var(--color-text-secondary)]">
            {title}
          </p>
          {description && (
            <p className="mt-px text-xs text-[var(--color-text-muted)]">{description}</p>
          )}
        </div>
        {action && (
          <div className="ml-auto shrink-0">{action}</div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        emphasis ? 'py-20' : 'py-16',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-[var(--radius-card)]',
            emphasis
              ? 'mb-5 h-14 w-14 border border-[var(--color-border)] bg-[var(--color-primary-subtle)] text-[var(--color-primary)] shadow-[var(--shadow-sm)]'
              : 'mb-4 h-12 w-12 bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className={cn(
          'mb-1 font-semibold text-[var(--color-text-primary)]',
          emphasis ? 'text-base' : 'text-[0.9375rem]'
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            'max-w-sm text-[0.8125rem] leading-[1.65] text-[var(--color-text-muted)]',
            emphasis ? 'mb-8' : 'mb-6'
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div className={cn('flex w-full justify-center', emphasis ? 'mt-2' : '')}>
          {action}
        </div>
      )}
    </div>
  )
}
