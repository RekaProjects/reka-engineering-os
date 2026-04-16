import type { CSSProperties } from 'react'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft:              { label: 'Draft',              color: '#6A6666', bg: '#F1EFE8' },
  internal_review:    { label: 'Internal Review',    color: '#B45309', bg: '#FFFBEB' },
  ready_to_submit:    { label: 'Ready to Submit',    color: '#142D50', bg: '#E8EEF8' },
  sent_to_client:     { label: 'Sent to Client',     color: '#142D50', bg: '#E8EEF8' },
  revision_requested: { label: 'Revision Requested', color: '#851E1E', bg: '#F8E9E8' },
  approved:           { label: 'Approved',           color: '#166534', bg: '#ECFDF3' },
  final_issued:       { label: 'Final Issued',       color: '#166534', bg: '#ECFDF3' },
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

export function DeliverableStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: '#6A6666', bg: '#F1EFE8' }
  return (
    <span style={{ ...badgeStyle, color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  )
}
