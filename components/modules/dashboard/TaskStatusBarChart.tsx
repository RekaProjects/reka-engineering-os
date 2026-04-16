import type { OpenTaskStatusCounts, TaskPipelineStatus } from '@/lib/dashboard/queries'

const ORDER: TaskPipelineStatus[] = ['to_do', 'in_progress', 'review', 'revision', 'blocked']

const LABELS: Record<TaskPipelineStatus, string> = {
  to_do:       'To do',
  in_progress: 'In progress',
  review:      'Review',
  revision:    'Revision',
  blocked:     'Blocked',
}

const STATUS_CONFIG: Record<
  TaskPipelineStatus,
  { barColor: string; trackColor: string; textColor: string; barTextColor: string; isRisk: boolean }
> = {
  to_do:       { barColor: '#B8B3A8', trackColor: '#EEECEA', textColor: '#7A7673',  barTextColor: '#454040', isRisk: false },
  in_progress: { barColor: '#142D50', trackColor: '#E6EDF7', textColor: '#142D50',  barTextColor: '#FFFDF7', isRisk: false },
  review:      { barColor: '#3A6490', trackColor: '#EAF1F9', textColor: '#2B5C8A',  barTextColor: '#FFFDF7', isRisk: false },
  revision:    { barColor: '#851E1E', trackColor: '#F5E8E8', textColor: '#851E1E',  barTextColor: '#FFFDF7', isRisk: true  },
  blocked:     { barColor: '#851E1E', trackColor: '#F5E8E8', textColor: '#851E1E',  barTextColor: '#FFFDF7', isRisk: true  },
}

export function TaskStatusBarChart({ counts }: { counts: OpenTaskStatusCounts }) {
  const total    = ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0)
  const maxCount = Math.max(...ORDER.map((k) => counts[k] ?? 0), 1)

  if (total === 0) {
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
          No open tasks in the pipeline.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {ORDER.map((key) => {
          const n   = counts[key] ?? 0
          const pct = (n / maxCount) * 100
          const cfg = STATUS_CONFIG[key]

          return (
            <div
              key={key}
              style={{
                display:             'grid',
                gridTemplateColumns: '84px 1fr 32px',
                gap:                 '10px',
                alignItems:          'center',
              }}
            >
              {/* Status label */}
              <span
                style={{
                  fontSize:    '0.75rem',
                  fontWeight:  n > 0 && cfg.isRisk ? 600 : 500,
                  color:       n > 0 ? cfg.textColor : 'var(--color-text-muted)',
                  textAlign:   'right',
                  whiteSpace:  'nowrap',
                  opacity:     n === 0 ? 0.45 : 1,
                  userSelect:  'none',
                }}
              >
                {LABELS[key]}
              </span>

              {/* Bar track */}
              <div
                style={{
                  height:          '20px',
                  borderRadius:    '4px',
                  backgroundColor: cfg.trackColor,
                  position:        'relative',
                  overflow:        'hidden',
                  border:
                    n > 0 && cfg.isRisk
                      ? '1px solid rgba(133,30,30,0.22)'
                      : '1px solid var(--color-border)',
                  opacity: n === 0 ? 0.35 : 1,
                }}
              >
                {n > 0 && (
                  <div
                    title={`${LABELS[key]}: ${n}`}
                    style={{
                      position:        'absolute',
                      left:            0,
                      top:             0,
                      bottom:          0,
                      width:           `${pct}%`,
                      backgroundColor: cfg.barColor,
                      minWidth:        '4px',
                      borderRadius:    '3px',
                      display:         'flex',
                      alignItems:      'center',
                      paddingLeft:     '7px',
                    }}
                  >
                    {pct >= 22 && (
                      <span
                        style={{
                          fontSize:           '0.6875rem',
                          fontWeight:         700,
                          color:              cfg.barTextColor,
                          fontVariantNumeric: 'tabular-nums',
                          lineHeight:         1,
                        }}
                      >
                        {n}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Count */}
              <span
                style={{
                  fontSize:           '0.8125rem',
                  fontWeight:         700,
                  color:              n > 0 && cfg.isRisk ? cfg.textColor : 'var(--color-text-secondary)',
                  fontVariantNumeric: 'tabular-nums',
                  textAlign:          'right',
                  opacity:            n === 0 ? 0.35 : 1,
                }}
              >
                {n}
              </span>
            </div>
          )
        })}
      </div>

      {/* Summary footer */}
      <div
        style={{
          marginTop:     '14px',
          paddingTop:    '10px',
          borderTop:     '1px solid var(--color-border)',
          display:       'flex',
          justifyContent: 'space-between',
          alignItems:    'center',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          Total open tasks
        </span>
        <span
          style={{
            fontSize:           '0.875rem',
            fontWeight:         700,
            color:              'var(--color-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {total}
        </span>
      </div>
    </div>
  )
}
