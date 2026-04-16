import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, Ban, MessageSquareWarning, RotateCcw } from 'lucide-react'

import type { NeedsAttentionData, WaitingClientProjectRow } from '@/lib/dashboard/queries'
import { formatDate } from '@/lib/utils/formatters'

type RowKind = 'overdue' | 'blocked' | 'revision' | 'waiting_client'

type MergedRow =
  | {
      kind: 'overdue'
      id: string
      title: string
      href: string
      meta: string
      accent: 'urgent'
    }
  | {
      kind: 'blocked'
      id: string
      title: string
      href: string
      meta: string
      accent: 'urgent'
    }
  | {
      kind: 'revision'
      id: string
      title: string
      href: string
      meta: string
      accent: 'urgent'
    }
  | {
      kind: 'waiting_client'
      id: string
      title: string
      href: string
      meta: string
      accent: 'neutral'
    }

function mergeRows(attention: NeedsAttentionData, waitingClient: WaitingClientProjectRow[]): MergedRow[] {
  const rows: MergedRow[] = []

  for (const t of attention.overdueTasks) {
    const code = t.projects?.project_code ?? '—'
    rows.push({
      kind: 'overdue',
      id: t.id,
      title: t.title,
      href: `/tasks/${t.id}`,
      meta: `${code} · Due ${t.due_date ? formatDate(t.due_date) : '—'}`,
      accent: 'urgent',
    })
  }
  for (const t of attention.blockedTasks) {
    const code = t.projects?.project_code ?? '—'
    rows.push({
      kind: 'blocked',
      id: t.id,
      title: t.title,
      href: `/tasks/${t.id}`,
      meta: `${code}${t.assignee?.full_name ? ` · ${t.assignee.full_name}` : ''}`,
      accent: 'urgent',
    })
  }
  for (const d of attention.revisionDeliverables) {
    const code = d.projects?.project_code ?? '—'
    rows.push({
      kind: 'revision',
      id: d.id,
      title: d.name,
      href: `/deliverables/${d.id}`,
      meta: code,
      accent: 'urgent',
    })
  }
  for (const p of waitingClient) {
    rows.push({
      kind: 'waiting_client',
      id: p.id,
      title: p.name,
      href: `/projects/${p.id}`,
      meta: `${p.project_code} · ${p.clients?.client_name ?? 'Client'} · Due ${formatDate(p.target_due_date)}`,
      accent: 'neutral',
    })
  }

  return rows
}

const KIND_LABEL: Record<RowKind, string> = {
  overdue: 'Overdue',
  blocked: 'Blocked',
  revision: 'Revision',
  waiting_client: 'Client',
}

const ICON: Record<RowKind, ReactNode> = {
  overdue: <AlertTriangle size={14} aria-hidden />,
  blocked: <Ban size={14} aria-hidden />,
  revision: <RotateCcw size={14} aria-hidden />,
  waiting_client: <MessageSquareWarning size={14} aria-hidden />,
}

export function AttentionQueue({
  attention,
  waitingClient,
  maxRows = 12,
}: {
  attention: NeedsAttentionData
  waitingClient: WaitingClientProjectRow[]
  maxRows?: number
}) {
  const rows = mergeRows(attention, waitingClient)
  const shown = rows.slice(0, maxRows)
  const hidden = rows.length - shown.length

  if (rows.length === 0) {
    return (
      <div
        style={{
          padding: '14px 4px',
          borderRadius: 'var(--radius-control)',
          border: '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.45 }}>
          No critical blockers in this queue. Overdue work, blocked tasks, revision requests, and client holds will rank here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0' }}>
        {shown.map((row, i) => {
          const borderColor =
            row.accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-primary)'
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
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  gap: '10px',
                  alignItems: 'start',
                  padding: '10px 4px',
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 'var(--radius-control)',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-control)',
                    backgroundColor: row.accent === 'urgent' ? 'var(--color-danger-subtle)' : 'var(--color-primary-subtle)',
                    color: row.accent === 'urgent' ? 'var(--color-danger)' : 'var(--color-primary)',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {ICON[row.kind]}
                </span>
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-muted)',
                      marginBottom: '2px',
                    }}
                  >
                    <span style={{ display: 'inline-block', borderLeft: `3px solid ${borderColor}`, paddingLeft: '8px' }}>{KIND_LABEL[row.kind]}</span>
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.35, display: 'block' }}>{row.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '2px', display: 'block' }}>{row.meta}</span>
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', flexShrink: 0, paddingTop: '6px' }}>→</span>
              </Link>
            </li>
          )
        })}
      </ul>
      {hidden > 0 && (
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '10px 0 0', paddingLeft: '4px' }}>
          +{hidden} more in backlog — use lists to triage.
        </p>
      )}
      <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '12px 16px' }}>
        <Link href="/tasks" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Open tasks →
        </Link>
        <Link href="/projects" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Projects →
        </Link>
        <Link href="/deliverables" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
          Deliverables →
        </Link>
      </div>
    </div>
  )
}
