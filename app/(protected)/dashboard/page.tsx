import type { CSSProperties } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  AlertCircle,
  Clock,
  FileText,
  CheckSquare,
  RotateCcw,
  AlertTriangle,
  Ban,
  Activity,
  Users,
  CalendarClock,
  CheckCircle2,
  Wallet,
} from 'lucide-react'

import { getSessionProfile } from '@/lib/auth/session'
import { effectiveRole } from '@/lib/auth/permissions'
import { PageHeader }   from '@/components/layout/PageHeader'
import { KpiCard }      from '@/components/shared/KpiCard'
import { SectionCard }  from '@/components/shared/SectionCard'
import { EmptyState }   from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { TaskStatusBadge }    from '@/components/modules/tasks/TaskStatusBadge'
import { ProjectStatusBadge } from '@/components/modules/projects/ProjectStatusBadge'
import { formatDate, formatRelativeDate, formatIDR } from '@/lib/utils/formatters'

import {
  getDashboardKpis,
  getNeedsAttention,
  getUrgentProjects,
  getUpcomingDeadlines,
  getTeamWorkload,
  type NeedsAttentionData,
  type UrgentProject,
  type UpcomingDeadlinesData,
  type WorkloadUser,
} from '@/lib/dashboard/queries'
import { getRecentActivity, type ActivityLogEntry } from '@/lib/activity/queries'
import {
  getMemberDashboard,
  getReviewerDashboard,
  getCoordinatorDashboard,
  type ScopedKpis,
  type ScopedTask,
  type ScopedDeliverable,
  type ScopedPayment,
} from '@/lib/dashboard/role-queries'

export const metadata = {
  title: 'Dashboard — Engineering Agency OS',
}

// ── Shared table styles ───────────────────────────────────────────────────────

const TH: CSSProperties = {
  padding: '8px 12px',
  textAlign: 'left',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  backgroundColor: 'var(--color-surface-subtle)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}

const TD: CSSProperties = {
  padding: '8px 12px',
  fontSize: '0.8125rem',
  color: 'var(--color-text-secondary)',
  verticalAlign: 'middle',
}

const ROW_LINK: CSSProperties = {
  fontWeight: 500,
  color: 'var(--color-text-primary)',
  textDecoration: 'none',
  fontSize: '0.8125rem',
}

const CODE_LINK: CSSProperties = {
  fontWeight: 500,
  color: 'var(--color-primary)',
  textDecoration: 'none',
  fontSize: '0.75rem',
}

// ═════════════════════════════════════════════════════════════════════════════
// SCOPED DASHBOARD — used for member, reviewer, and coordinator
// ═════════════════════════════════════════════════════════════════════════════

function ScopedKpiRow({ kpis }: { kpis: ScopedKpis }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
      <KpiCard label="Active Projects" value={kpis.activeProjects} icon={<FolderKanban size={18} />} />
      <KpiCard label="Open Tasks" value={kpis.openTasks} icon={<CheckSquare size={18} />} />
      <KpiCard label="Overdue Tasks" value={kpis.overdueTasks} icon={<AlertCircle size={18} />}
        description={kpis.overdueTasks > 0 ? 'Needs action' : undefined} />
      <KpiCard label="Due This Week" value={kpis.dueThisWeek} icon={<Clock size={18} />} />
      {kpis.awaitingReview > 0 && (
        <KpiCard label="Awaiting Review" value={kpis.awaitingReview} icon={<FileText size={18} />} />
      )}
    </div>
  )
}

function ScopedTasksSection({ tasks, title }: { tasks: ScopedTask[]; title: string }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <SectionCard title={title}>
      {tasks.length === 0 ? (
        <EmptyState icon={<CheckSquare size={20} />} title="No open tasks" description="You're all caught up." className="py-8" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={TH}>Task</th><th style={TH}>Project</th><th style={TH}>Due</th><th style={TH}>Priority</th><th style={TH}>Status</th>
            </tr></thead>
            <tbody>
              {tasks.map((t, i) => {
                const overdue = t.due_date && t.due_date < today
                return (
                  <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                    <td style={TD}><Link href={`/tasks/${t.id}`} style={ROW_LINK}>{t.title}</Link></td>
                    <td style={TD}>{t.projects ? <Link href={`/projects/${t.projects.id}`} style={CODE_LINK}>{t.projects.project_code}</Link> : '—'}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap', color: overdue ? '#DC2626' : 'var(--color-text-muted)', fontWeight: overdue ? 600 : 400, fontSize: '0.75rem' }}>
                      {overdue && <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                      {t.due_date ? formatDate(t.due_date) : '—'}
                    </td>
                    <td style={TD}><PriorityBadge priority={t.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} /></td>
                    <td style={TD}><TaskStatusBadge status={t.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function ScopedDeliverablesSection({ deliverables, title }: { deliverables: ScopedDeliverable[]; title: string }) {
  return (
    <SectionCard title={title}>
      {deliverables.length === 0 ? (
        <EmptyState icon={<FileText size={20} />} title="No active deliverables" description="Deliverables will appear here." className="py-8" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              <th style={TH}>Deliverable</th><th style={TH}>Type</th><th style={TH}>Project</th><th style={TH}>Status</th>
            </tr></thead>
            <tbody>
              {deliverables.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < deliverables.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <td style={TD}><Link href={`/deliverables/${d.id}`} style={ROW_LINK}>{d.name}</Link></td>
                  <td style={{ ...TD, textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</td>
                  <td style={TD}>{d.projects ? <Link href={`/projects/${d.projects.id}`} style={CODE_LINK}>{d.projects.project_code}</Link> : '—'}</td>
                  <td style={{ ...TD, textTransform: 'capitalize' }}>{d.status.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function ScopedPaymentsSection({ payments }: { payments: ScopedPayment[] }) {
  if (payments.length === 0) return null
  const PAYMENT_STATUS_STYLE: Record<string, CSSProperties> = {
    unpaid:  { color: '#DC2626', backgroundColor: '#FEE2E2' },
    partial: { color: '#D97706', backgroundColor: '#FEF3C7' },
    paid:    { color: '#027A48', backgroundColor: '#ECFDF3' },
  }
  return (
    <SectionCard title="My Payments">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            <th style={TH}>Period</th><th style={{ ...TH, textAlign: 'right' }}>Due</th><th style={{ ...TH, textAlign: 'right' }}>Paid</th><th style={{ ...TH, textAlign: 'right' }}>Balance</th><th style={TH}>Status</th>
          </tr></thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                <td style={{ ...TD, fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.period_label ?? '—'}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatIDR(p.total_due)}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatIDR(p.total_paid)}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: p.balance > 0 ? 600 : 400 }}>{formatIDR(p.balance)}</td>
                <td style={TD}>
                  <span style={{
                    display: 'inline-flex', borderRadius: '9999px', padding: '2px 8px',
                    fontSize: '0.6875rem', fontWeight: 600, textTransform: 'capitalize',
                    ...(PAYMENT_STATUS_STYLE[p.payment_status] ?? {}),
                  }}>{p.payment_status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: '12px' }}>
        <Link href="/my-payments" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
          View all payments →
        </Link>
      </div>
    </SectionCard>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD — full operational view (same as before Sprint 04B)
// ═════════════════════════════════════════════════════════════════════════════

function NeedsAttentionSection({ data }: { data: NeedsAttentionData }) {
  const total = data.overdueTasks.length + data.blockedTasks.length + data.revisionDeliverables.length
  if (total === 0) {
    return (
      <SectionCard title="Needs Attention">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 4px', color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
          <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
          No overdue tasks, blocked tasks, or revision requests right now.
        </div>
      </SectionCard>
    )
  }
  return (
    <SectionCard title="Needs Attention" actions={<span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', backgroundColor: '#FEE2E2', borderRadius: '9999px', padding: '2px 8px' }}>{total}</span>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {data.overdueTasks.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <AlertTriangle size={13} /> Overdue Tasks
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={TH}>Task</th><th style={TH}>Project</th><th style={TH}>Assigned To</th><th style={TH}>Due</th><th style={TH}>Priority</th></tr></thead>
                <tbody>
                  {data.overdueTasks.map((task, i) => (
                    <tr key={task.id} style={{ borderBottom: i < data.overdueTasks.length - 1 ? '1px solid var(--color-border)' : undefined, backgroundColor: '#FFFBEB' }}>
                      <td style={TD}><Link href={`/tasks/${task.id}`} style={ROW_LINK}>{task.title}</Link></td>
                      <td style={TD}>{task.projects ? <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>{task.projects.project_code}</Link> : '—'}</td>
                      <td style={TD}>{task.assignee?.full_name ?? '—'}</td>
                      <td style={{ ...TD, color: '#D97706', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(task.due_date)}</td>
                      <td style={TD}><PriorityBadge priority={task.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {data.blockedTasks.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <Ban size={13} /> Blocked Tasks
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={TH}>Task</th><th style={TH}>Project</th><th style={TH}>Assigned To</th><th style={TH}>Reason</th></tr></thead>
                <tbody>
                  {data.blockedTasks.map((task, i) => (
                    <tr key={task.id} style={{ borderBottom: i < data.blockedTasks.length - 1 ? '1px solid var(--color-border)' : undefined, backgroundColor: '#FEF2F2' }}>
                      <td style={TD}><Link href={`/tasks/${task.id}`} style={ROW_LINK}>{task.title}</Link></td>
                      <td style={TD}>{task.projects ? <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>{task.projects.project_code}</Link> : '—'}</td>
                      <td style={TD}>{task.assignee?.full_name ?? '—'}</td>
                      <td style={{ ...TD, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{task.blocked_reason ? (task.blocked_reason.length > 60 ? task.blocked_reason.slice(0, 60) + '…' : task.blocked_reason) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {data.revisionDeliverables.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              <RotateCcw size={13} /> Revision Requested
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={TH}>Deliverable</th><th style={TH}>Type</th><th style={TH}>Project</th></tr></thead>
                <tbody>
                  {data.revisionDeliverables.map((d, i) => (
                    <tr key={d.id} style={{ borderBottom: i < data.revisionDeliverables.length - 1 ? '1px solid var(--color-border)' : undefined, backgroundColor: '#FFFBEB' }}>
                      <td style={TD}><Link href={`/deliverables/${d.id}`} style={ROW_LINK}>{d.name}</Link></td>
                      <td style={{ ...TD, textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</td>
                      <td style={TD}>{d.projects ? <Link href={`/projects/${d.projects.id}`} style={CODE_LINK}>{d.projects.project_code}</Link> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function UrgentProjectsSection({ projects }: { projects: UrgentProject[] }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <SectionCard title="Urgent Projects">
      {projects.length === 0 ? (
        <EmptyState icon={<FolderKanban size={20} />} title="No active projects" description="Active projects will appear here ordered by due date." className="py-8" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={TH}>Project</th><th style={TH}>Client</th><th style={TH}>Due</th><th style={TH}>Status</th></tr></thead>
            <tbody>
              {projects.map((p, i) => {
                const isOverdue = p.target_due_date < today
                return (
                  <tr key={p.id} style={{ borderBottom: i < projects.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                    <td style={TD}>
                      <div>
                        <Link href={`/projects/${p.id}`} style={ROW_LINK}>{p.name}</Link>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{p.project_code} · {p.lead?.full_name ?? '—'}</div>
                      </div>
                    </td>
                    <td style={{ ...TD, fontSize: '0.75rem' }}>{p.clients?.client_name ?? '—'}</td>
                    <td style={{ ...TD, whiteSpace: 'nowrap', color: isOverdue ? '#DC2626' : 'var(--color-text-muted)', fontWeight: isOverdue ? 600 : 400, fontSize: '0.75rem' }}>
                      {isOverdue && <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                      {formatDate(p.target_due_date)}
                    </td>
                    <td style={TD}><ProjectStatusBadge status={p.status} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

function UpcomingDeadlinesSection({ data }: { data: UpcomingDeadlinesData }) {
  const hasData = data.tasks.length > 0 || data.projects.length > 0
  return (
    <SectionCard title="Upcoming Deadlines">
      {!hasData ? (
        <EmptyState icon={<CalendarClock size={20} />} title="No upcoming deadlines" description="Tasks and projects due in the next 2–4 weeks will appear here." className="py-8" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {data.tasks.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Tasks — next 14 days</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={TH}>Task</th><th style={TH}>Project</th><th style={TH}>Assigned To</th><th style={TH}>Due</th><th style={TH}>Status</th></tr></thead>
                  <tbody>
                    {data.tasks.map((task, i) => (
                      <tr key={task.id} style={{ borderBottom: i < data.tasks.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                        <td style={TD}><Link href={`/tasks/${task.id}`} style={ROW_LINK}>{task.title}</Link></td>
                        <td style={TD}>{task.projects ? <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>{task.projects.project_code}</Link> : '—'}</td>
                        <td style={{ ...TD, fontSize: '0.75rem' }}>{task.assignee?.full_name ?? '—'}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{formatDate(task.due_date)}</td>
                        <td style={TD}><TaskStatusBadge status={task.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {data.projects.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>Projects — next 28 days</p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr><th style={TH}>Project</th><th style={TH}>Lead</th><th style={TH}>Due</th><th style={TH}>Priority</th><th style={TH}>Status</th></tr></thead>
                  <tbody>
                    {data.projects.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < data.projects.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                        <td style={TD}><div><Link href={`/projects/${p.id}`} style={ROW_LINK}>{p.name}</Link><div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>{p.project_code}</div></div></td>
                        <td style={{ ...TD, fontSize: '0.75rem' }}>{p.lead?.full_name ?? '—'}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>{formatDate(p.target_due_date)}</td>
                        <td style={TD}><PriorityBadge priority={p.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} /></td>
                        <td style={TD}><ProjectStatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  )
}

const ENTITY_LABELS: Record<string, string> = { project: 'Project', task: 'Task', deliverable: 'Deliverable', intake: 'Intake' }
const ACTION_LABELS: Record<string, string> = { created: 'created', updated: 'updated', status_updated: 'status updated', converted: 'converted to project' }

function RecentActivitySection({ entries }: { entries: ActivityLogEntry[] }) {
  return (
    <SectionCard title="Recent Activity">
      {entries.length === 0 ? (
        <EmptyState icon={<Activity size={20} />} title="No activity yet" description="Activity will appear here as projects, tasks, and deliverables are updated." className="py-8" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {entries.map((entry, i) => {
            const description = entry.note ?? `${ENTITY_LABELS[entry.entity_type] ?? entry.entity_type} ${ACTION_LABELS[entry.action_type] ?? entry.action_type}`
            return (
              <div key={entry.id} style={{ display: 'flex', gap: '10px', padding: '9px 0', borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : undefined, alignItems: 'flex-start' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--color-border)', flexShrink: 0, marginTop: '5px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.4, margin: 0 }}>{description}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>{entry.actor?.full_name ?? 'System'} · {formatRelativeDate(entry.created_at)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

const WORKLOAD_BADGE: Record<WorkloadUser['label'], CSSProperties> = {
  Low:        { color: '#475569', backgroundColor: '#F1F5F9' },
  Normal:     { color: '#1D4ED8', backgroundColor: '#DBEAFE' },
  High:       { color: '#D97706', backgroundColor: '#FEF3C7' },
  Overloaded: { color: '#DC2626', backgroundColor: '#FEE2E2' },
}

function TeamWorkloadSection({ users }: { users: WorkloadUser[] }) {
  return (
    <SectionCard title="Team Workload">
      {users.length === 0 ? (
        <EmptyState icon={<Users size={20} />} title="No active workload" description="Assigned open tasks will appear here grouped by team member." className="py-8" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={TH}>Team Member</th><th style={{ ...TH, textAlign: 'right' }}>Open Tasks</th><th style={{ ...TH, textAlign: 'right' }}>Overdue</th><th style={TH}>Load</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <td style={{ ...TD, fontWeight: 500, color: 'var(--color-text-primary)' }}>{u.full_name}</td>
                  <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{u.openTasks}</td>
                  <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: u.overdueTasks > 0 ? '#DC2626' : 'var(--color-text-muted)', fontWeight: u.overdueTasks > 0 ? 600 : 400 }}>{u.overdueTasks > 0 ? u.overdueTasks : '—'}</td>
                  <td style={TD}><span style={{ display: 'inline-flex', alignItems: 'center', borderRadius: '9999px', padding: '2px 8px', fontSize: '0.6875rem', fontWeight: 600, ...WORKLOAD_BADGE[u.label] }}>{u.label}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default async function DashboardPage() {
  const profile = await getSessionProfile()
  const role = effectiveRole(profile.system_role)

  // ── Member dashboard ──
  if (role === 'member') {
    const data = await getMemberDashboard(profile.id)
    return (
      <div>
        <PageHeader title="My Dashboard" subtitle="Your tasks, deliverables, and payment status." />
        <ScopedKpiRow kpis={data.kpis} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
          <ScopedTasksSection tasks={data.tasks} title="My Open Tasks" />
          <ScopedDeliverablesSection deliverables={data.deliverables} title="My Deliverables" />
        </div>
        <ScopedPaymentsSection payments={data.payments} />
      </div>
    )
  }

  // ── Reviewer dashboard ──
  if (role === 'reviewer') {
    const data = await getReviewerDashboard(profile.id)
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Items waiting for your review." />
        <ScopedKpiRow kpis={data.kpis} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
          <ScopedTasksSection tasks={data.tasks} title="Review Tasks" />
          <ScopedDeliverablesSection deliverables={data.deliverables} title="Review Deliverables" />
        </div>
        <ScopedPaymentsSection payments={data.payments} />
      </div>
    )
  }

  // ── Coordinator dashboard ──
  if (role === 'coordinator') {
    const data = await getCoordinatorDashboard(profile.id)
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Operational overview of your assigned projects." />
        <ScopedKpiRow kpis={data.kpis} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
          <ScopedTasksSection tasks={data.tasks} title="Open Tasks" />
          <ScopedDeliverablesSection deliverables={data.deliverables} title="Active Deliverables" />
        </div>
      </div>
    )
  }

  // ── Admin dashboard — full operational view ──
  const [kpis, attention, urgent, deadlines, activity, workload] = await Promise.all([
    getDashboardKpis(),
    getNeedsAttention(),
    getUrgentProjects(),
    getUpcomingDeadlines(),
    getRecentActivity(20),
    getTeamWorkload(),
  ])

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Operational overview — active projects, deadlines, blockers, and team workload." />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <KpiCard label="Active Projects" value={kpis.activeProjects} icon={<FolderKanban size={18} />} />
        <KpiCard label="Overdue Tasks" value={kpis.overdueTasks} icon={<AlertCircle size={18} />} description={kpis.overdueTasks > 0 ? 'Needs action' : undefined} />
        <KpiCard label="Due This Week" value={kpis.dueThisWeek} icon={<Clock size={18} />} />
        <KpiCard label="Awaiting Review" value={kpis.awaitingReview} icon={<FileText size={18} />} />
        <KpiCard label="Waiting on Client" value={kpis.waitingClient} icon={<CheckSquare size={18} />} />
        <KpiCard label="In Revision" value={kpis.inRevision} icon={<RotateCcw size={18} />} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
        <NeedsAttentionSection data={attention} />
        <UrgentProjectsSection projects={urgent} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
        <UpcomingDeadlinesSection data={deadlines} />
        <RecentActivitySection entries={activity} />
      </div>

      <TeamWorkloadSection users={workload} />
    </div>
  )
}
