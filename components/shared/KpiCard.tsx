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

export function KpiCard({
  label,
  value,
  icon,
  description,
  className,
  variant = 'default',
  accent  = 'none',
}: KpiCardProps) {

  const accentColor =
    accent === 'urgent'  ? 'var(--color-danger)'  :
    accent === 'warning' ? 'var(--color-warning)' :
    accent === 'primary' ? 'var(--color-primary)'  :
    'var(--color-text-muted)'

  const accentBorderColor =
    accent === 'urgent'  ? 'var(--color-danger)'  :
    accent === 'warning' ? 'var(--color-warning)' :
    accent === 'primary' ? 'var(--color-primary)'  :
    'transparent'

  const iconBg =
    accent === 'urgent'  ? 'var(--color-danger-subtle)'  :
    accent === 'warning' ? 'var(--color-warning-subtle)' :
    accent === 'primary' ? 'var(--color-primary-subtle)'  :
    'var(--color-surface-muted)'

  return (
    <Card
      className={cn('relative px-4 pb-4 pt-3.5', className)}
      style={{ borderTop: `4px solid ${accentBorderColor}` }}
    >
      {/* Icon — top-right */}
      {icon && (
        <div
          aria-hidden="true"
          className="absolute right-3.5 top-3.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[7px]"
          style={{ backgroundColor: iconBg, color: accentColor }}
        >
          {icon}
        </div>
      )}

      {/* Label */}
      <p
        className={cn(
          'mb-2.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.06em] text-[var(--color-text-muted)]',
          icon && 'pr-10'
        )}
      >
        {label}
      </p>

      {/* Value */}
      <p
        className="text-[2rem] font-bold leading-none tracking-[-0.02em] tabular-nums"
        style={{ color: accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-text-primary)' }}
      >
        {value}
      </p>

      {/* Optional description */}
      {description && (
        <p
          className="mt-1.5 text-xs leading-snug"
          style={{
            color:      accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-text-muted)',
            fontWeight: accent === 'urgent' ? 600 : 400,
          }}
        >
          {description}
        </p>
      )}
    </Card>
  )
}
