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
 * KpiCard — headline metric tile.
 *
 * Stage 3.6b composition:
 *   • Taller card (min-h-[156px]) so 4 tiles across carry real weight.
 *   • Label row at top, large value mid, meta line pinned at bottom —
 *     fills the card so no tile looks half-empty.
 *   • Value 2.125rem / 600 / tracking-[-0.025em] — a real headline.
 *   • Accented variants (primary/urgent/warning) carry subtle top→bottom
 *     tint gradient; neutral tiles stay clean porcelain.
 *   • Icon pill 10×10 rounded-xl with ringed token, anchored top-right.
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
    accent === 'primary' ? 'text-[var(--color-primary)] font-medium' :
    'text-[var(--color-text-muted)]'

  const iconTone =
    accent === 'urgent'  ? 'bg-[var(--color-danger)]/10  text-[var(--color-danger)]  ring-1 ring-[var(--color-danger)]/15'  :
    accent === 'warning' ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] ring-1 ring-[var(--color-warning)]/15' :
    accent === 'primary' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]/15' :
    'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]'

  const surfaceTint =
    accent === 'urgent'  ? 'bg-gradient-to-b from-[var(--color-danger-subtle)]/50  to-[var(--color-surface)]' :
    accent === 'warning' ? 'bg-gradient-to-b from-[var(--color-warning-subtle)]/60 to-[var(--color-surface)]' :
    accent === 'primary' ? 'bg-gradient-to-b from-[var(--color-primary-subtle)]/50 to-[var(--color-surface)]' :
    ''

  const accentBar =
    accent === 'urgent'  ? 'border-l-[3px] border-l-[var(--color-danger)]'  :
    accent === 'warning' ? 'border-l-[3px] border-l-[var(--color-warning)]' :
    accent === 'primary' ? 'border-l-[3px] border-l-[var(--color-primary)]' :
    ''

  return (
    <Card
      className={cn(
        'relative flex min-h-[156px] flex-col justify-between overflow-hidden p-6',
        surfaceTint,
        accentBar,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.09em] text-[var(--color-text-muted)]">
          {label}
        </p>

        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              iconTone
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <p
        className={cn(
          'mt-4 text-[2.125rem] font-semibold leading-[1.02] tracking-[-0.025em] tabular-nums',
          valueTone
        )}
      >
        {value}
      </p>

      <p
        className={cn(
          'mt-3 text-[0.75rem] leading-snug',
          description ? descTone : 'text-[var(--color-text-muted)]/50'
        )}
      >
        {description ?? '—'}
      </p>
    </Card>
  )
}
