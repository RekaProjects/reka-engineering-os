import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title?:       string
  description?: string
  actions?:     ReactNode
  children:     ReactNode
  className?:   string
  noPadding?:   boolean
}

export function SectionCard({
  title,
  description,
  actions,
  children,
  className,
  noPadding = false,
}: SectionCardProps) {
  return (
    <div
      className={cn('', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        borderRadius:    '8px',
        boxShadow:       '0 1px 2px rgba(29,31,30,0.05)',
      }}
    >
      {(title || description || actions) && (
        <div
          className="flex items-start justify-between gap-4"
          style={{
            padding:         '12px 16px',
            borderBottom:    '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-muted)',
            borderRadius:    '8px 8px 0 0',
          }}
        >
          <div className="min-w-0">
            {title && (
              <h2
                style={{
                  fontSize:   '0.875rem',
                  fontWeight: 700,
                  color:      'var(--color-text-primary)',
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                style={{
                  fontSize:  '0.75rem',
                  color:     'var(--color-text-muted)',
                  marginTop: title ? '2px' : 0,
                  lineHeight: 1.4,
                }}
              >
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      )}
      <div style={noPadding ? {} : { padding: '16px' }}>{children}</div>
    </div>
  )
}
