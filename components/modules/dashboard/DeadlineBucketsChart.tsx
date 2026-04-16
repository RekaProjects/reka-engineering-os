import type { DeadlineBuckets } from '@/lib/dashboard/queries'

function WeekRow({
  label,
  sub,
  tasks,
  projects,
  max,
  isUrgent,
}: {
  label:    string
  sub:      string
  tasks:    number
  projects: number
  max:      number
  isUrgent?: boolean
}) {
  const sum            = tasks + projects
  const trackWidthPct  = max > 0 ? (sum / max) * 100 : 0
  const taskSeg        = sum > 0 ? (tasks    / sum) * 100 : 0
  const projSeg        = sum > 0 ? (projects / sum) * 100 : 0
  const taskColor      = isUrgent ? '#851E1E' : '#142D50'
  const taskBg         = isUrgent ? '#F5E8E8' : '#E6EDF7'
  const projColor      = isUrgent ? '#C85A5A' : '#3A6490'
  const projBg         = isUrgent ? '#F9EEEE' : '#EAF1F9'
  const trackBg        = isUrgent ? '#FBF0F0' : 'var(--color-surface-subtle)'
  const trackBorder    = isUrgent ? '1px solid rgba(133,30,30,0.16)' : '1px solid var(--color-border)'

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Row header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'baseline',
          marginBottom:   '6px',
        }}
      >
        <span
          style={{
            fontSize:   '0.8125rem',
            fontWeight: 600,
            color:      isUrgent && sum > 0 ? taskColor : 'var(--color-text-primary)',
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>{sub}</span>
      </div>

      {/* Bar track */}
      <div
        style={{
          height:          '28px',
          borderRadius:    '5px',
          backgroundColor: sum === 0 ? 'var(--color-surface-subtle)' : trackBg,
          border:          sum === 0 ? '1px solid var(--color-border)' : trackBorder,
          position:        'relative',
          overflow:        'hidden',
        }}
      >
        {sum > 0 && (
          <div
            style={{
              position: 'absolute',
              left:     0,
              top:      0,
              bottom:   0,
              width:    `${trackWidthPct}%`,
              display:  'flex',
            }}
          >
            {tasks > 0 && (
              <div
                title={`Tasks: ${tasks}`}
                style={{
                  width:           `${taskSeg}%`,
                  backgroundColor: taskColor,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '0.6875rem',
                  fontWeight:      700,
                  color:           '#FFFDF7',
                  minWidth:        '4px',
                }}
              >
                {taskSeg >= 20 ? tasks : ''}
              </div>
            )}
            {projects > 0 && (
              <div
                title={`Projects: ${projects}`}
                style={{
                  width:           `${projSeg}%`,
                  backgroundColor: projColor,
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '0.6875rem',
                  fontWeight:      700,
                  color:           '#FFFDF7',
                  borderLeft:      tasks > 0 ? '1px solid rgba(255,255,255,0.25)' : undefined,
                  minWidth:        '4px',
                }}
              >
                {projSeg >= 20 ? projects : ''}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div
        style={{
          display:   'flex',
          gap:       '14px',
          marginTop: '5px',
          fontSize:  '0.6875rem',
          color:     'var(--color-text-muted)',
        }}
      >
        <span>
          Tasks{' '}
          <strong
            style={{
              color:              isUrgent && tasks > 0 ? taskColor : 'var(--color-text-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {tasks}
          </strong>
        </span>
        <span>
          Projects{' '}
          <strong
            style={{
              color:              isUrgent && projects > 0 ? projColor : 'var(--color-text-secondary)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {projects}
          </strong>
        </span>
        {sum > 0 && (
          <span style={{ marginLeft: 'auto', fontWeight: 600, color: isUrgent ? taskColor : 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
            {sum} total
          </span>
        )}
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
          padding:         '20px 16px',
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
      <WeekRow
        label="This week"
        sub="Next 0–7 days"
        tasks={buckets.week1.tasks}
        projects={buckets.week1.projects}
        max={max}
        isUrgent={w1 > 0}
      />
      <WeekRow
        label="Next week"
        sub="Days 8–14"
        tasks={buckets.week2.tasks}
        projects={buckets.week2.projects}
        max={max}
        isUrgent={false}
      />

      {/* Legend */}
      <div
        style={{
          display:    'flex',
          gap:        '14px',
          marginTop:  '4px',
          fontSize:   '0.6875rem',
          color:      'var(--color-text-muted)',
          paddingTop: '8px',
          borderTop:  '1px solid var(--color-border)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width:           '10px',
              height:          '10px',
              borderRadius:    '2px',
              backgroundColor: '#142D50',
              flexShrink:      0,
              display:         'inline-block',
            }}
          />
          Tasks
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span
            style={{
              width:           '10px',
              height:          '10px',
              borderRadius:    '2px',
              backgroundColor: '#3A6490',
              flexShrink:      0,
              display:         'inline-block',
            }}
          />
          Projects
        </span>
      </div>
    </div>
  )
}
