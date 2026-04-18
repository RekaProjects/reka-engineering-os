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
 * v0-style composition with Stage 3.6 depth:
 *   • Uppercase tracking-[0.08em] label, icon pill on the right.
 *   • Large tabular value (font-semibold, tracking tight).
 *   • Accented variants (primary/urgent/warning) get a very subtle
 *     top-to-bottom tint using the accent's subtle token — this gives
 *     the tile dimension without a heavy shadow.
 *   • Neutral tiles stay clean porcelain.
 *   • A persistent bottom meta row keeps every tile on the same
 *     baseline even when `description` is absent — no jittery heights.
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
    'bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]'

  // Very subtle accent tint — gives the tile depth without shouting.
  const surfaceTint =
    accent === 'urgent'  ? 'bg-gradient-to-b from-[var(--color-danger-subtle)]/40  to-[var(--color-surface)]' :
    accent === 'warning' ? 'bg-gradient-to-b from-[var(--color-warning-subtle)]/50 to-[var(--color-surface)]' :
    accent === 'primary' ? 'bg-gradient-to-b from-[var(--color-primary-subtle)]/40 to-[var(--color-surface)]' :
    ''

  const accentBar =
    accent === 'urgent'  ? 'border-l-2 border-l-[var(--color-danger)]'  :
    accent === 'warning' ? 'border-l-2 border-l-[var(--color-warning)]' :
    ''

  return (
    <Card className={cn('relative overflow-hidden p-5', surfaceTint, accentBar, className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.08em] text-[var(--color-text-muted)]">
            {label}
          </p>
          <p
            className={cn(
              'mt-3 text-[1.875rem] font-semibold leading-[1.05] tracking-[-0.025em] tabular-nums',
              valueTone
            )}
          >
            {value}
          </p>
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

      {/* Persistent meta baseline — keeps all tiles aligned.
          When description is present, use it; otherwise render a faint em-dash
          so the visual row exists but reads as "no signal". */}
      <p
        className={cn(
          'mt-2.5 text-[0.75rem] leading-snug',
          description ? descTone : 'text-[var(--color-text-muted)]/50'
        )}
      >
        {description ?? '—'}
      </p>
    </Card>
  )
}
