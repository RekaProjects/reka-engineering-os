import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, Ban, MessageSquareWarning, RotateCcw } from 'lucide-react'

import type { NeedsAttentionData, WaitingClientProjectRow } from '@/lib/dashboard/queries'
import { formatDate } from '@/lib/utils/formatters'

type RowKind = 'overdue' | 'blocked' | 'revision' | 'waiting_client'

type MergedRow =
  | { kind: 'overdue';        id: string; title: string; href: string; meta: string; accent: 'urgent'  }
  | { kind: 'blocked';        id: string; title: string; href: string; meta: string; accent: 'urgent'  }
  | { kind: 'revision';       id: string; title: string; href: string; meta: string; accent: 'urgent'  }
  | { kind: 'waiting_client'; id: string; title: string; href: string; meta: string; accent: 'neutral' }

function mergeRows(attention: NeedsAttentionData, waitingClient: WaitingClientProjectRow[]): MergedRow[] {
  const rows: MergedRow[] = []

  for (const t of attention.overdueTasks) {
    const code = t.projects?.project_code ?? '—'
    rows.push({
      kind:   'overdue',
      id:     t.id,
      title:  t.title,
      href:   `/tasks/${t.id}`,
      meta:   `${code} · Due ${t.due_date ? formatDate(t.due_date) : '—'}`,
      accent: 'urgent',
    })
  }
  for (const t of attention.blockedTasks) {
    const code = t.projects?.project_code ?? '—'
    rows.push({
      kind:   'blocked',
      id:     t.id,
      title:  t.title,
      href:   `/tasks/${t.id}`,
      meta:   `${code}${t.assignee?.full_name ? ` · ${t.assignee.full_name}` : ''}`,
      accent: 'urgent',
    })
  }
  for (const d of attention.revisionDeliverables) {
    const code = d.projects?.project_code ?? '—'
    rows.push({
      kind:   'revision',
      id:     d.id,
      title:  d.name,
      href:   `/deliverables/${d.id}`,
      meta:   code,
      accent: 'urgent',
    })
  }
  for (const p of waitingClient) {
    rows.push({
      kind:   'waiting_client',
      id:     p.id,
      title:  p.name,
      href:   `/projects/${p.id}`,
      meta:   `${p.project_code} · ${p.clients?.client_name ?? 'Client'} · Due ${formatDate(p.target_due_date)}`,
      accent: 'neutral',
    })
  }

  return rows
}

const KIND_LABEL: Record<RowKind, string> = {
  overdue:        'Overdue',
  blocked:        'Blocked',
  revision:       'Revision',
  waiting_client: 'Client hold',
}

const ICON: Record<RowKind, ReactNode> = {
  overdue:        <AlertTriangle      size={14} aria-hidden />,
  blocked:        <Ban                size={14} aria-hidden />,
  revision:       <RotateCcw          size={14} aria-hidden />,
  waiting_client: <MessageSquareWarning size={14} aria-hidden />,
}

const KIND_COLORS: Record<RowKind, { icon: string; iconBg: string; bar: string }> = {
  overdue:        { icon: 'var(--color-danger)',  iconBg: 'var(--color-danger-subtle)',  bar: 'var(--color-danger)'  },
  blocked:        { icon: 'var(--color-danger)',  iconBg: 'var(--color-danger-subtle)',  bar: 'var(--color-danger)'  },
  revision:       { icon: 'var(--color-warning)', iconBg: 'var(--color-warning-subtle)', bar: 'var(--color-warning)' },
  waiting_client: { icon: 'var(--color-primary)', iconBg: 'var(--color-primary-subtle)', bar: 'var(--color-primary)' },
}

export function AttentionQueue({
  attention,
  waitingClient,
  maxRows = 12,
}: {
  attention:     NeedsAttentionData
  waitingClient: WaitingClientProjectRow[]
  maxRows?:      number
}) {
  const rows  = mergeRows(attention, waitingClient)
  const shown = rows.slice(0, maxRows)
  const hidden = rows.length - shown.length

  if (rows.length === 0) {
    return (
      <div>
        <div
          style={{
            padding:         '16px',
            borderRadius:    'var(--radius-control)',
            border:          '1px dashed var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            marginBottom:    '12px',
          }}
        >
          <p
            style={{
              fontSize:  '0.8125rem',
              color:     'var(--color-text-muted)',
              margin:    0,
              lineHeight: 1.5,
            }}
          >
            No critical blockers in this queue.{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              Overdue tasks, blocked work, revision requests, and client holds will rank here as they arise.
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
          <Link href="/tasks"       style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Open tasks →</Link>
          <Link href="/projects"    style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Projects →</Link>
          <Link href="/deliverables" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Deliverables →</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {shown.map((row, i) => {
          const clr = KIND_COLORS[row.kind]
          return (
            <li
              key={`${row.kind}-${row.id}`}
              style={{
                borderBottom: i < shown.length - 1 ? '1px solid var(--color-border)' : undefined,
              }}
            >
              <Link
                href={row.href}
                style={{
                  display:             'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap:                 '10px',
                  alignItems:          'start',
                  padding:             '10px 2px',
                  textDecoration:      'none',
                  color:               'inherit',
                  borderRadius:        'var(--radius-control)',
                }}
              >
                {/* Icon badge */}
                <span
                  style={{
                    display:         'inline-flex',
                    alignItems:      'center',
                    justifyContent:  'center',
                    width:           '28px',
                    height:          '28px',
                    borderRadius:    'var(--radius-control)',
                    backgroundColor: clr.iconBg,
                    color:           clr.icon,
                    flexShrink:      0,
                    marginTop:       '1px',
                  }}
                >
                  {ICON[row.kind]}
                </span>

                {/* Content */}
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display:       'block',
                      fontSize:      '0.625rem',
                      fontWeight:    700,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      marginBottom:  '3px',
                    }}
                  >
                    <span
                      style={{
                        display:     'inline-block',
                        borderLeft:  `3px solid ${clr.bar}`,
                        paddingLeft: '7px',
                        color:       clr.icon,
                        lineHeight:  1.2,
                      }}
                    >
                      {KIND_LABEL[row.kind]}
                    </span>
                  </span>
                  <span
                    style={{
                      fontSize:   '0.875rem',
                      fontWeight: 600,
                      color:      'var(--color-text-primary)',
                      lineHeight: 1.35,
                      display:    'block',
                      overflow:   'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.title}
                  </span>
                  <span
                    style={{
                      fontSize:   '0.75rem',
                      color:      'var(--color-text-muted)',
                      marginTop:  '2px',
                      display:    'block',
                      overflow:   'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {row.meta}
                  </span>
                </span>

                {/* Arrow */}
                <span
                  style={{
                    fontSize:   '0.75rem',
                    fontWeight: 600,
                    color:      'var(--color-primary)',
                    flexShrink: 0,
                    paddingTop: '6px',
                    opacity:    0.6,
                  }}
                >
                  →
                </span>
              </Link>
            </li>
          )
        })}
      </ul>

      {hidden > 0 && (
        <p
          style={{
            fontSize:   '0.75rem',
            color:      'var(--color-text-muted)',
            margin:     '10px 0 0',
            paddingLeft: '4px',
          }}
        >
          +{hidden} more — use the task and deliverable lists to triage.
        </p>
      )}

      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px 16px' }}>
        <Link href="/tasks"        style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Open tasks →</Link>
        <Link href="/projects"     style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Projects →</Link>
        <Link href="/deliverables" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>Deliverables →</Link>
      </div>
    </div>
  )
}
