import type { WorkloadUser } from '@/lib/dashboard/queries'

const LOAD_COLOR: Record<string, string> = {
  Overloaded: '#851E1E',
  High:       '#8A4A08',
  Medium:     '#142D50',
  Low:        '#4A7098',
}

const LOAD_BG: Record<string, string> = {
  Overloaded: '#F5E8E8',
  High:       '#FDF3E7',
  Medium:     '#E6EDF7',
  Low:        '#EAF0F9',
}

const LOAD_BORDER: Record<string, string> = {
  Overloaded: '#851E1E',
  High:       '#8A4A08',
  Medium:     'transparent',
  Low:        'transparent',
}

export function WorkloadBars({ users }: { users: WorkloadUser[] }) {
  if (users.length === 0) {
    return (
      <div
        style={{
          padding:         '20px 16px',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {users.map((u) => {
        const pct        = (u.openTasks / maxOpen) * 100
        const barColor   = LOAD_COLOR[u.label]  ?? LOAD_COLOR['Low']
        const trackBg    = LOAD_BG[u.label]     ?? LOAD_BG['Low']
        const accentBorder = LOAD_BORDER[u.label] ?? 'transparent'
        const isAtRisk   = u.label === 'Overloaded' || u.label === 'High'

        return (
          <div
            key={u.id}
            style={{
              paddingLeft:  isAtRisk ? '8px' : '0',
              borderLeft:   isAtRisk ? `3px solid ${accentBorder}` : '3px solid transparent',
              paddingTop:   isAtRisk ? '2px' : '0',
              paddingBottom: isAtRisk ? '2px' : '0',
            }}
          >
            {/* Name + counts */}
            <div
              style={{
                display:        'flex',
                justifyContent: 'space-between',
                alignItems:     'baseline',
                marginBottom:   '5px',
              }}
            >
              <span
                style={{
                  fontSize:     '0.875rem',
                  fontWeight:   isAtRisk ? 600 : 500,
                  color:        'var(--color-text-primary)',
                  maxWidth:     '58%',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace:   'nowrap',
                }}
              >
                {u.full_name}
              </span>
              <span
                style={{
                  fontSize:   '0.75rem',
                  color:      u.overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-text-muted)',
                  fontWeight: u.overdueTasks > 0 ? 600 : 400,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {u.openTasks} open
                {u.overdueTasks > 0 ? ` · ${u.overdueTasks} overdue` : ''}
              </span>
            </div>

            {/* Bar track */}
            <div
              style={{
                height:          '14px',
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
                }}
              />
            </div>

            {/* Load label */}
            <p
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '4px',
                marginTop:       '4px',
                fontSize:        '0.625rem',
                fontWeight:      600,
                textTransform:   'uppercase',
                letterSpacing:   '0.05em',
                color:           barColor,
                backgroundColor: trackBg,
                padding:         '2px 7px',
                borderRadius:    '3px',
                lineHeight:      1,
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
