'use client'

import { cn } from '@/lib/utils/cn'
import type { ReactNode, CSSProperties } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface QuickActionButtonProps {
  label: string
  icon?: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
  'aria-label'?: string
}

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    backgroundColor: 'var(--color-primary)',
    color: 'var(--color-primary-fg)',
    border: 'none',
  },
  secondary: {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    border: 'none',
  },
  danger: {
    backgroundColor: 'var(--color-danger)',
    color: 'var(--color-danger-fg)',
    border: 'none',
  },
}

export function QuickActionButton({
  label,
  icon,
  onClick,
  variant = 'secondary',
  disabled = false,
  className,
  type = 'button',
  'aria-label': ariaLabel,
}: QuickActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={cn('inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-opacity', className)}
      style={{
        ...variantStyles[variant],
        borderRadius: 'var(--radius-control)',
        fontSize: '0.8125rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {icon && <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {label}
    </button>
  )
}
