import { cn } from '@/lib/utils/cn'
import { Card } from '@/components/ui/card'
import type { ReactNode } from 'react'

interface KpiCardProps {
  label:        string
  value:        string | number
  icon?:        ReactNode
  description?: string
  className?:   string
  variant?:     'default' | 'dashboard'
  accent?:      'none' | 'primary' | 'urgent' | 'warning'
}

/**
 * KpiCard — premium summary tile.
 *
 * v0-style composition:
 *   • Title row: uppercase label (soft, tracking-wider) on the left,
 *     a rounded-lg icon pill on the right.
 *   • Large tabular value below (font-semibold, not bold).
 *   • Optional description line beneath.
 *   • Subtle left-border accent for `urgent` and `warning` states only —
 *     never on default/primary, so the strip never looks decorative.
 */
export function KpiCard({
  label,
  value,
  icon,
  description,
  className,
  accent = 'none',
}: KpiCardProps) {

  const valueTone =
    accent === 'urgent'  ? 'text-[var(--color-danger)]'  :
    accent === 'warning' ? 'text-[var(--color-warning)]' :
    'text-[var(--color-text-primary)]'

  const descTone =
    accent === 'urgent'  ? 'text-[var(--color-danger)] font-medium'  :
    accent === 'warning' ? 'text-[var(--color-warning)] font-medium' :
    'text-[var(--color-text-muted)]'

  const iconTone =
    accent === 'urgent'  ? 'bg-[var(--color-danger-subtle)]  text-[var(--color-danger)]'  :
    accent === 'warning' ? 'bg-[var(--color-warning-subtle)] text-[var(--color-warning)]' :
    accent === 'primary' ? 'bg-[var(--color-primary-subtle)] text-[var(--color-primary)]' :
    'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'

  const accentBar =
    accent === 'urgent'  ? 'border-l-2 border-l-[var(--color-danger)]'  :
    accent === 'warning' ? 'border-l-2 border-l-[var(--color-warning)]' :
    ''

  return (
    <Card className={cn('p-5', accentBar, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-medium uppercase leading-none tracking-[0.08em] text-[var(--color-text-muted)]">
            {label}
          </p>
          <p
            className={cn(
              'mt-3 text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] tabular-nums',
              valueTone
            )}
          >
            {value}
          </p>
          {description && (
            <p className={cn('mt-1.5 text-xs leading-snug', descTone)}>
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              iconTone
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
