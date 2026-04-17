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
    <div className={cn('mb-6 flex items-start justify-between gap-4', className)}>
      {/* Left: optional breadcrumb + title + subtitle */}
      <div className="min-w-0">
        {breadcrumb && (
          <Link
            href={breadcrumb.href}
            className="mb-1.5 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-text-muted)] no-underline transition-colors hover:text-[var(--color-primary)]"
          >
            ← {breadcrumb.label}
          </Link>
        )}
        <h1 className="text-[1.375rem] font-bold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: action buttons */}
      {actions && (
        <div
          className={cn('flex shrink-0 items-center gap-2', breadcrumb ? 'mt-[26px]' : 'mt-0.5')}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
