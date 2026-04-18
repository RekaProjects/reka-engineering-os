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

/**
 * PageHeader — top of every page. Premium typography:
 *   • Title: 1.625rem / 600 / tracking-tight  (feels like a product heading,
 *     not a form label)
 *   • Subtitle: 0.875rem / muted, sits with a small top gap
 *   • Optional breadcrumb above the title, optional actions aligned right
 */
export function PageHeader({ title, subtitle, actions, className, breadcrumb }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
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
        <h1 className="text-[1.625rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--color-text-primary)]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-[0.875rem] leading-snug text-[var(--color-text-muted)]">
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: action buttons */}
      {actions && (
        <div
          className={cn('flex shrink-0 items-center gap-2', breadcrumb ? 'mt-7' : 'mt-1')}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
