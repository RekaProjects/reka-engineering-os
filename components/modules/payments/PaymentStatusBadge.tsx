import type { PaymentStatus } from '@/types/database'

const CONFIG: Record<PaymentStatus, { label: string; bg: string; color: string }> = {
  unpaid:  { label: 'Unpaid',  bg: '#FEF3F2', color: '#B42318' },
  partial: { label: 'Partial', bg: '#FFFAEB', color: '#B54708' },
  paid:    { label: 'Paid',    bg: '#ECFDF3', color: '#027A48' },
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const c = CONFIG[status] ?? CONFIG.unpaid
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 9px',
        borderRadius: '999px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        backgroundColor: c.bg,
        color: c.color,
        letterSpacing: '0.02em',
      }}
    >
      {c.label}
    </span>
  )
}
