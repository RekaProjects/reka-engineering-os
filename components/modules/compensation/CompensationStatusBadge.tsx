import type { CSSProperties } from 'react'
import type { CompensationStatus } from '@/types/database'

const CONFIG: Record<CompensationStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Draft',     bg: '#F1EFE8', color: '#6A6666' },
  confirmed: { label: 'Confirmed', bg: '#E8EEF8', color: '#142D50' },
  paid:      { label: 'Paid',      bg: '#ECFDF3', color: '#166534' },
  cancelled: { label: 'Cancelled', bg: '#F8E9E8', color: '#851E1E' },
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

export function CompensationStatusBadge({ status }: { status: CompensationStatus }) {
  const c = CONFIG[status] ?? CONFIG.draft
  return (
    <span style={{ ...badgeStyle, backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  )
}
