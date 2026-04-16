import type { CSSProperties } from 'react'
import type { PaymentStatus } from '@/types/database'

const CONFIG: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  unpaid:  { label: 'Unpaid',  bg: '#F8E9E8', color: '#851E1E' },
  partial: { label: 'Partial', bg: '#FFFBEB', color: '#B45309' },
  paid:    { label: 'Paid',    bg: '#ECFDF3', color: '#166534' },
}

const badgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: 'var(--radius-pill)',
  fontSize: '0.6875rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  letterSpacing: '0.01em',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const c = CONFIG[status] ?? CONFIG.unpaid
  return (
    <span style={{ ...badgeStyle, backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}
