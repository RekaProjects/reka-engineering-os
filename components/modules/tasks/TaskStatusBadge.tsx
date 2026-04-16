import type { CSSProperties } from 'react'

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  to_do:       { label: 'To Do',       color: '#6A6666', bg: '#F1EFE8' },
  in_progress: { label: 'In Progress', color: '#142D50', bg: '#E8EEF8' },
  review:      { label: 'Review',      color: '#B45309', bg: '#FFFBEB' },
  revision:    { label: 'Revision',    color: '#851E1E', bg: '#F8E9E8' },
  blocked:     { label: 'Blocked',     color: '#851E1E', bg: '#F8E9E8' },
  done:        { label: 'Done',        color: '#166534', bg: '#ECFDF3' },
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

export function TaskStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: '#6A6666', bg: '#F1EFE8' }
  return (
    <span style={{ ...badgeStyle, color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  )
}
