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
        className={cn('flex items-center gap-3 px-4 py-3', className)}
        style={{
          backgroundColor: 'var(--color-surface-subtle)',
          borderRadius:    'var(--radius-control)',
          border:          '1px dashed var(--color-border)',
        }}
      >
        {icon && (
          <span
            style={{ color: 'var(--color-text-muted)', display: 'flex', flexShrink: 0 }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <div style={{ minWidth: 0 }}>
          <p
            style={{
              fontSize:   '0.8125rem',
              fontWeight: 500,
              color:      'var(--color-text-secondary)',
              lineHeight: 1.35,
            }}
          >
            {title}
          </p>
          {description && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <div style={{ flexShrink: 0, marginLeft: 'auto' }}>{action}</div>
        )}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center px-6',
        emphasis ? 'py-20' : 'py-16',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'flex items-center justify-center',
            emphasis ? 'mb-5 h-14 w-14' : 'mb-4 h-12 w-12'
          )}
          style={{
            backgroundColor: emphasis ? 'var(--color-primary-subtle)' : 'var(--color-surface-muted)',
            color:           emphasis ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderRadius:    'var(--radius-card)',
            border:          emphasis ? '1px solid var(--color-border)' : 'none',
            boxShadow:       emphasis ? 'var(--shadow-sm)' : undefined,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        className="mb-1 font-semibold"
        style={{
          color:    'var(--color-text-primary)',
          fontSize: emphasis ? '1rem' : '0.9375rem',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn('max-w-sm', emphasis ? 'mb-8' : 'mb-6')}
          style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', lineHeight: '1.65' }}
        >
          {description}
        </p>
      )}
      {action && (
        <div className="flex w-full justify-center" style={{ marginTop: emphasis ? '8px' : 0 }}>
          {action}
        </div>
      )}
    </div>
  )
}
