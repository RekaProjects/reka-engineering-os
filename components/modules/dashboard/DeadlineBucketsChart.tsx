import type { DeadlineBuckets } from '@/lib/dashboard/queries'

function WeekRow({
  label,
  sub,
  tasks,
  projects,
  max,
}: {
  label:    string
  sub:      string
  tasks:    number
  projects: number
  max:      number
}) {
  const sum          = tasks + projects
  const trackWidthPct = max > 0 ? (sum / max) * 100 : 0
  const taskSeg       = sum > 0 ? (tasks    / sum) * 100 : 0
  const projSeg       = sum > 0 ? (projects / sum) * 100 : 0

  return (
    <div style={{ marginBottom: '14px' }}>
      {/* Row header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{sub}</span>
      </div>

      {/* Bar track */}
      <div
        style={{
          height:          '20px',
          borderRadius:    '4px',
          backgroundColor: 'var(--color-surface-subtle)',
          border:          '1px solid var(--color-border)',
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {sum > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 0, top: 0, bottom: 0,
              width: `${trackWidthPct}%`,
              display: 'flex',
            }}
          >
            {tasks > 0 && (
              <div
                title={`Tasks: ${tasks}`}
                style={{
                  width:           `${taskSeg}%`,
                  backgroundColor: '#142D50',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '0.625rem',
                  fontWeight:      700,
                  color:           '#FFFDF7',
                }}
              >
                {taskSeg >= 25 ? tasks : ''}
              </div>
            )}
            {projects > 0 && (
              <div
                title={`Projects: ${projects}`}
                style={{
                  width:           `${projSeg}%`,
                  backgroundColor: '#E6EDF7',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '0.625rem',
                  fontWeight:      700,
                  color:           '#142D50',
                  borderLeft:      tasks > 0 ? '1px solid #CDD8EE' : undefined,
                }}
              >
                {projSeg >= 25 ? projects : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
        <span>Tasks <strong style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{tasks}</strong></span>
        <span>Projects <strong style={{ color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{projects}</strong></span>
      </div>
    </div>
  )
}

export function DeadlineBucketsChart({ buckets }: { buckets: DeadlineBuckets }) {
  const w1  = buckets.week1.tasks + buckets.week1.projects
  const w2  = buckets.week2.tasks + buckets.week2.projects
  const max = Math.max(w1, w2, 1)

  if (w1 + w2 === 0) {
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
          No tasks or projects due in the next 14 days.
        </p>
      </div>
    )
  }

  return (
    <div>
      <WeekRow label="Week 1" sub="Next 0–7 days" tasks={buckets.week1.tasks} projects={buckets.week1.projects} max={max} />
      <WeekRow label="Week 2" sub="Days 8–14"     tasks={buckets.week2.tasks} projects={buckets.week2.projects} max={max} />
    </div>
  )
}
