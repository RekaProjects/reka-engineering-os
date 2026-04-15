import type { CompensationStatus } from '@/types/database'

const CONFIG: Record<CompensationStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Draft',     bg: '#F2F4F7', color: '#344054' },
  confirmed: { label: 'Confirmed', bg: '#EFF8FF', color: '#175CD3' },
  paid:      { label: 'Paid',      bg: '#ECFDF3', color: '#027A48' },
  cancelled: { label: 'Cancelled', bg: '#FEF3F2', color: '#B42318' },
}

export function CompensationStatusBadge({ status }: { status: CompensationStatus }) {
  const c = CONFIG[status] ?? CONFIG.draft
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
