import type { OpenTaskStatusCounts, TaskPipelineStatus } from '@/lib/dashboard/queries'

const ORDER: TaskPipelineStatus[] = ['to_do', 'in_progress', 'review', 'revision', 'blocked']

const LABELS: Record<TaskPipelineStatus, string> = {
  to_do:       'To do',
  in_progress: 'In progress',
  review:      'Review',
  revision:    'Revision',
  blocked:     'Blocked',
}

const SEGMENT_STYLE: Record<TaskPipelineStatus, { bg: string; fg: string; dot: string }> = {
  to_do:       { bg: '#EEECEA', fg: '#7A7673', dot: '#C8C3B8' },
  in_progress: { bg: '#142D50', fg: '#FFFDF7', dot: '#142D50' },
  review:      { bg: '#E6EDF7', fg: '#142D50', dot: '#142D50' },
  revision:    { bg: '#851E1E', fg: '#FFFDF7', dot: '#851E1E' },
  blocked:     { bg: '#F5E8E8', fg: '#851E1E', dot: '#851E1E' },
}

export function TaskStatusBarChart({ counts }: { counts: OpenTaskStatusCounts }) {
  const total = ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0)

  if (total === 0) {
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
          No open tasks in the pipeline.
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Stacked bar */}
      <div
        role="img"
        aria-label={`Open tasks by status, ${total} total`}
        style={{
          display:      'flex',
          height:       '28px',
          borderRadius: '4px',
          overflow:     'hidden',
          border:       '1px solid var(--color-border)',
          gap:          '1px',
          backgroundColor: 'var(--color-border)',
        }}
      >
        {ORDER.map((key) => {
          const n = counts[key] ?? 0
          if (n === 0) return null
          const pct = (n / total) * 100
          const { bg, fg } = SEGMENT_STYLE[key]
          return (
            <div
              key={key}
              title={`${LABELS[key]}: ${n}`}
              style={{
                width:           `${pct}%`,
                backgroundColor: bg,
                minWidth:        '4px',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                fontSize:        '0.6875rem',
                fontWeight:      700,
                color:           fg,
              }}
            >
              {pct >= 12 ? n : ''}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <ul
        style={{
          listStyle: 'none',
          margin:    '10px 0 0',
          padding:   0,
          display:   'flex',
          flexWrap:  'wrap',
          gap:       '8px 14px',
        }}
      >
        {ORDER.map((key) => {
          const n = counts[key] ?? 0
          const { dot } = SEGMENT_STYLE[key]
          return (
            <li key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '2px', backgroundColor: dot, flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-muted)' }}>{LABELS[key]}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>{n}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
