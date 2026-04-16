import { cn } from '@/lib/utils/cn'
import type { CSSProperties, ReactNode } from 'react'

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
    <div
      className={cn(className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        borderRadius:    '8px',
        padding:         '14px 16px 16px',
        boxShadow:       '0 1px 2px rgba(29,31,30,0.05)',
        borderTop:       `4px solid ${accentBorderColor}`,
        position:        'relative',
      }}
    >
      {/* Icon — top-right block */}
      {icon && (
        <div
          style={{
            position:        'absolute',
            top:             '14px',
            right:           '14px',
            width:           '32px',
            height:          '32px',
            borderRadius:    '7px',
            backgroundColor: iconBg,
            display:         'flex',
            alignItems:      'center',
            justifyContent:  'center',
            color:           accentColor,
            flexShrink:      0,
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      {/* Label */}
      <p
        style={{
          fontSize:      '0.6875rem',
          fontWeight:    600,
          color:         'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          lineHeight:    1,
          marginBottom:  '10px',
          paddingRight:  icon ? '40px' : 0,
        }}
      >
        {label}
      </p>

      {/* Value */}
      <p
        style={{
          fontSize:           '2rem',
          fontWeight:         700,
          color:              accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-text-primary)',
          lineHeight:         1,
          fontVariantNumeric: 'tabular-nums',
          letterSpacing:      '-0.02em',
        }}
      >
        {value}
      </p>

      {/* Optional description */}
      {description && (
        <p
          style={{
            fontSize:   '0.75rem',
            color:      accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-text-muted)',
            marginTop:  '5px',
            fontWeight: accent === 'urgent' ? 600 : 400,
            lineHeight: 1.3,
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
