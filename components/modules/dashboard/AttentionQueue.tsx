import type { ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, Ban, ChevronRight, MessageSquareWarning, RotateCcw } from 'lucide-react'

import type { NeedsAttentionData, WaitingClientProjectRow } from '@/lib/dashboard/queries'
import { formatDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

type RowKind = 'overdue' | 'blocked' | 'revision' | 'waiting_client'

type MergedRow =
  | { kind: 'overdue';        id: string; title: string; href: string; project: string; detailLabel: string; detailValue: string }
  | { kind: 'blocked';        id: string; title: string; href: string; project: string; detailLabel: string; detailValue: string }
  | { kind: 'revision';       id: string; title: string; href: string; project: string; detailLabel: string; detailValue: string }
  | { kind: 'waiting_client'; id: string; title: string; href: string; project: string; detailLabel: string; detailValue: string }

function mergeRows(attention: NeedsAttentionData, waitingClient: WaitingClientProjectRow[]): MergedRow[] {
  const rows: MergedRow[] = []

  for (const t of attention.overdueTasks) {
    rows.push({
      kind:        'overdue',
      id:          t.id,
      title:       t.title,
      href:        `/tasks/${t.id}`,
      project:     t.projects?.project_code ?? '—',
      detailLabel: 'Due',
      detailValue: t.due_date ? formatDate(t.due_date) : '—',
    })
  }
  for (const t of attention.blockedTasks) {
    rows.push({
      kind:        'blocked',
      id:          t.id,
      title:       t.title,
      href:        `/tasks/${t.id}`,
      project:     t.projects?.project_code ?? '—',
      detailLabel: 'Assignee',
      detailValue: t.assignee?.full_name ?? '—',
    })
  }
  for (const d of attention.revisionDeliverables) {
    rows.push({
      kind:        'revision',
      id:          d.id,
      title:       d.name,
      href:        `/deliverables/${d.id}`,
      project:     d.projects?.project_code ?? '—',
      detailLabel: 'Status',
      detailValue: 'Revision',
    })
  }
  for (const p of waitingClient) {
    rows.push({
      kind:        'waiting_client',
      id:          p.id,
      title:       p.name,
      href:        `/projects/${p.id}`,
      project:     `${p.project_code} · ${p.clients?.client_name ?? 'Client'}`,
      detailLabel: 'Due',
      detailValue: formatDate(p.target_due_date),
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

const KIND_ICON: Record<RowKind, ReactNode> = {
  overdue:        <AlertTriangle       className="h-3.5 w-3.5" aria-hidden />,
  blocked:        <Ban                 className="h-3.5 w-3.5" aria-hidden />,
  revision:       <RotateCcw           className="h-3.5 w-3.5" aria-hidden />,
  waiting_client: <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden />,
}

/**
 * Row-wrapper classes per kind. Mirrors the v0 pattern:
 *   - overdue / blocked → danger-subtle background
 *   - revision          → warning-subtle background
 *   - waiting_client    → neutral surface-muted background
 * Opacity hover provides interaction affordance.
 */
const KIND_ROW_CLASS: Record<RowKind, string> = {
  overdue:        'bg-[var(--color-danger-subtle)]  hover:bg-[var(--color-danger-subtle)]/70',
  blocked:        'bg-[var(--color-danger-subtle)]  hover:bg-[var(--color-danger-subtle)]/70',
  revision:       'bg-[var(--color-warning-subtle)] hover:bg-[var(--color-warning-subtle)]/70',
  waiting_client: 'bg-[var(--color-surface-muted)]  hover:bg-[var(--color-surface-muted)]/70',
}

const KIND_BADGE_CLASS: Record<RowKind, string> = {
  overdue:        'bg-[var(--color-danger)]/10  text-[var(--color-danger)]',
  blocked:        'bg-[var(--color-danger)]/10  text-[var(--color-danger)]',
  revision:       'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  waiting_client: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
}

export function AttentionQueue({
  attention,
  waitingClient,
  maxRows = 8,
}: {
  attention:     NeedsAttentionData
  waitingClient: WaitingClientProjectRow[]
  maxRows?:      number
}) {
  const rows   = mergeRows(attention, waitingClient)
  const shown  = rows.slice(0, maxRows)
  const hidden = rows.length - shown.length

  if (rows.length === 0) {
    return (
      <div>
        <div className="mb-3 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4">
          <p className="m-0 text-[0.8125rem] leading-relaxed text-[var(--color-text-muted)]">
            No critical blockers in this queue.{' '}
            <span className="text-[var(--color-text-secondary)]">
              Overdue tasks, blocked work, revision requests, and client holds will rank here as they arise.
            </span>
          </p>
        </div>
        <QuickLinks />
      </div>
    )
  }

  return (
    <div>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {shown.map((row) => (
          <li key={`${row.kind}-${row.id}`}>
            <Link
              href={row.href}
              className={cn(
                'flex items-center gap-3 rounded-[var(--radius-control)] p-3 text-inherit no-underline transition-colors',
                KIND_ROW_CLASS[row.kind]
              )}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-[var(--radius-pill)] px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.05em]',
                      KIND_BADGE_CLASS[row.kind]
                    )}
                  >
                    {KIND_ICON[row.kind]}
                    {KIND_LABEL[row.kind]}
                  </span>
                  <span className="truncate font-mono text-[0.6875rem] text-[var(--color-text-muted)]">
                    {row.project}
                  </span>
                </div>
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {row.title}
                </p>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-[0.6875rem] text-[var(--color-text-muted)]">{row.detailLabel}</p>
                <p className="truncate text-xs font-medium text-[var(--color-text-secondary)]">
                  {row.detailValue}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>

      {hidden > 0 && (
        <p className="mt-3 pl-1 text-xs text-[var(--color-text-muted)]">
          +{hidden} more — use the task and deliverable lists to triage.
        </p>
      )}

      <div className="mt-3">
        <QuickLinks />
      </div>
    </div>
  )
}

function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <Link href="/tasks"        className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline">Open tasks →</Link>
      <Link href="/projects"     className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline">Projects →</Link>
      <Link href="/deliverables" className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline">Deliverables →</Link>
    </div>
  )
}
