import { cn } from '@/lib/utils/cn'
import type { CSSProperties } from 'react'
import type { StatusVariant } from '@/lib/constants/statuses'

interface StatusBadgeProps {
  label:     string
  variant?:  StatusVariant
  className?: string
}

/**
 * StatusBadge — the single shared badge primitive for all status displays.
 *
 * Colors are driven by CSS variables (--badge-*) defined in globals.css.
 * Stage 4 will migrate all module-specific badge components to use this primitive.
 *
 * Variants map to semantic states:
 *   neutral — new, draft, on-hold, default
 *   active  — ongoing, in-progress, confirmed, active
 *   review  — awaiting review, partial, warning states
 *   success — completed, paid, approved, done
 *   danger  — overdue, blocked, cancelled, revision, urgent
 */
const variantStyles: Record<StatusVariant, CSSProperties> = {
  neutral: { color: 'var(--badge-neutral-text)', backgroundColor: 'var(--badge-neutral-bg)' },
  active:  { color: 'var(--badge-active-text)',  backgroundColor: 'var(--badge-active-bg)'  },
  review:  { color: 'var(--badge-review-text)',  backgroundColor: 'var(--badge-review-bg)'  },
  success: { color: 'var(--badge-success-text)', backgroundColor: 'var(--badge-success-bg)' },
  danger:  { color: 'var(--badge-danger-text)',  backgroundColor: 'var(--badge-danger-bg)'  },
}

export function StatusBadge({ label, variant = 'neutral', className }: StatusBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center whitespace-nowrap', className)}
      style={{
        borderRadius:    'var(--radius-pill)',
        padding:         '2px 10px',
        fontSize:        '0.6875rem',
        fontWeight:      600,
        letterSpacing:   '0.01em',
        ...variantStyles[variant],
      }}
    >
      {label}
    </span>
  )
}
