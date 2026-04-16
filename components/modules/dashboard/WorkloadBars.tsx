import type { WorkloadUser } from '@/lib/dashboard/queries'

const LOAD_COLOR: Record<string, string> = {
  'Overloaded': '#851E1E',
  'High':       '#8A4A08',
  'Medium':     '#142D50',
  'Low':        '#4A7098',
}

const LOAD_BG: Record<string, string> = {
  'Overloaded': '#F5E8E8',
  'High':       '#FDF3E7',
  'Medium':     '#E6EDF7',
  'Low':        '#EAF0F9',
}

export function WorkloadBars({ users }: { users: WorkloadUser[] }) {
  if (users.length === 0) {
    return (
      <div
        style={{
          padding:         '16px',
          borderRadius:    '6px',
          border:          '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
          No open assignments. Task load will appear here as work is assigned.
        </p>
      </div>
    )
  }

  const maxOpen = Math.max(...users.map((u) => u.openTasks), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {users.map((u) => {
        const pct       = (u.openTasks / maxOpen) * 100
        const barColor  = LOAD_COLOR[u.label]  ?? LOAD_COLOR['Low']
        const trackBg   = LOAD_BG[u.label]     ?? LOAD_BG['Low']

        return (
          <div key={u.id}>
            {/* Name + count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize:     '0.8125rem',
                  fontWeight:   500,
                  color:        'var(--color-text-primary)',
                  maxWidth:     '60%',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}
              >
                {u.full_name}
              </span>
              <span
                style={{
                  fontSize:   '0.6875rem',
                  color:      u.overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                  fontWeight: u.overdueTasks > 0 ? 600 : 400,
                }}
              >
                {u.openTasks} open
                {u.overdueTasks > 0 ? ` · ${u.overdueTasks} overdue` : ''}
              </span>
            </div>

            {/* Bar track */}
            <div
              style={{
                height:          '8px',
                borderRadius:    '4px',
                backgroundColor: 'var(--color-surface-muted)',
                border:          '1px solid var(--color-border)',
                overflow:        'hidden',
              }}
            >
              <div
                style={{
                  width:           `${pct}%`,
                  height:          '100%',
                  borderRadius:    '4px',
                  backgroundColor: barColor,
                  transition:      'width 0.3s ease',
                }}
              />
            </div>

            {/* Load label */}
            <p
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '4px',
                marginTop:       '3px',
                fontSize:        '0.625rem',
                fontWeight:      600,
                textTransform:   'uppercase',
                letterSpacing:   '0.05em',
                color:           barColor,
                backgroundColor: trackBg,
                padding:         '1px 6px',
                borderRadius:    '3px',
              }}
            >
              {u.label} load
            </p>
          </div>
        )
      })}
    </div>
  )
}
