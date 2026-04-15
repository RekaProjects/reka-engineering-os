const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  to_do:       { label: 'To Do',       color: '#94A3B8', bg: '#F1F5F9' },
  in_progress: { label: 'In Progress', color: '#2563EB', bg: '#DBEAFE' },
  review:      { label: 'Review',      color: '#D97706', bg: '#FEF3C7' },
  revision:    { label: 'Revision',    color: '#EA580C', bg: '#FFF7ED' },
  blocked:     { label: 'Blocked',     color: '#DC2626', bg: '#FEE2E2' },
  done:        { label: 'Done',        color: '#16A34A', bg: '#DCFCE7' },
}

export function TaskStatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, color: '#94A3B8', bg: '#F1F5F9' }
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '0.6875rem',
        fontWeight: 600,
        color: cfg.color,
        backgroundColor: cfg.bg,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}
