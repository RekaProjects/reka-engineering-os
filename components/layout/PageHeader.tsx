import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title:      string
  subtitle?:  string
  actions?:   ReactNode
  className?: string
  /** Optional back-link rendered above the title. Used on detail and edit pages. */
  breadcrumb?: { label: string; href: string }
}

export function PageHeader({ title, subtitle, actions, className, breadcrumb }: PageHeaderProps) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4', className)}
      style={{ marginBottom: '24px' }}
    >
      {/* Left: optional breadcrumb + title + subtitle */}
      <div className="min-w-0">
        {breadcrumb && (
          <Link
            href={breadcrumb.href}
            style={{
              display:        'inline-flex',
              alignItems:     'center',
              gap:            '4px',
              fontSize:       '0.75rem',
              fontWeight:     500,
              color:          'var(--color-text-muted)',
              textDecoration: 'none',
              marginBottom:   '6px',
              transition:     'color 0.1s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
          >
            ← {breadcrumb.label}
          </Link>
        )}
        <h1
          style={{
            fontSize:      '1.375rem',
            fontWeight:    700,
            color:         'var(--color-text-primary)',
            lineHeight:    '1.3',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize:  '0.8125rem',
              color:     'var(--color-text-muted)',
              marginTop: '3px',
              lineHeight: '1.4',
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: action buttons */}
      {actions && (
        <div
          className="flex items-center gap-2 shrink-0"
          style={{ marginTop: breadcrumb ? '26px' : '2px' }}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
