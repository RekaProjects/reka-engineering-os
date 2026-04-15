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
} from 'lucide-react'

import { PageHeader }   from '@/components/layout/PageHeader'
import { KpiCard }      from '@/components/shared/KpiCard'
import { SectionCard }  from '@/components/shared/SectionCard'
import { EmptyState }   from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { TaskStatusBadge }    from '@/components/modules/tasks/TaskStatusBadge'
import { ProjectStatusBadge } from '@/components/modules/projects/ProjectStatusBadge'
import { formatDate, formatRelativeDate } from '@/lib/utils/formatters'

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

export const metadata = {
  title: 'Dashboard — Engineering Agency OS',
}

// ── Shared table styles ───────────────────────────────────────────────────────

const TH_STYLE: CSSProperties = {
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

const TD_STYLE: CSSProperties = {
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

// ── Needs Attention section ───────────────────────────────────────────────────

function NeedsAttentionSection({ data }: { data: NeedsAttentionData }) {
  const total =
    data.overdueTasks.length +
    data.blockedTasks.length +
    data.revisionDeliverables.length

  if (total === 0) {
    return (
      <SectionCard title="Needs Attention">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 4px',
            color: 'var(--color-text-muted)',
            fontSize: '0.8125rem',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
          No overdue tasks, blocked tasks, or revision requests right now.
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Needs Attention"
      actions={
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#DC2626',
            backgroundColor: '#FEE2E2',
            borderRadius: '9999px',
            padding: '2px 8px',
          }}
        >
          {total}
        </span>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Overdue tasks */}
        {data.overdueTasks.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <AlertTriangle size={13} />
              Overdue Tasks
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>Task</th>
                    <th style={TH_STYLE}>Project</th>
                    <th style={TH_STYLE}>Assigned To</th>
                    <th style={TH_STYLE}>Due</th>
                    <th style={TH_STYLE}>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.overdueTasks.map((task, i) => (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom:
                          i < data.overdueTasks.length - 1
                            ? '1px solid var(--color-border)'
                            : undefined,
                        backgroundColor: '#FFFBEB',
                      }}
                    >
                      <td style={TD_STYLE}>
                        <Link href={`/tasks/${task.id}`} style={ROW_LINK}>
                          {task.title}
                        </Link>
                      </td>
                      <td style={TD_STYLE}>
                        {task.projects ? (
                          <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>
                            {task.projects.project_code}
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={TD_STYLE}>{task.assignee?.full_name ?? '—'}</td>
                      <td style={{ ...TD_STYLE, color: '#D97706', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {formatDate(task.due_date)}
                      </td>
                      <td style={TD_STYLE}>
                        <PriorityBadge priority={task.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Blocked tasks */}
        {data.blockedTasks.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#DC2626',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <Ban size={13} />
              Blocked Tasks
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>Task</th>
                    <th style={TH_STYLE}>Project</th>
                    <th style={TH_STYLE}>Assigned To</th>
                    <th style={TH_STYLE}>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {data.blockedTasks.map((task, i) => (
                    <tr
                      key={task.id}
                      style={{
                        borderBottom:
                          i < data.blockedTasks.length - 1
                            ? '1px solid var(--color-border)'
                            : undefined,
                        backgroundColor: '#FEF2F2',
                      }}
                    >
                      <td style={TD_STYLE}>
                        <Link href={`/tasks/${task.id}`} style={ROW_LINK}>
                          {task.title}
                        </Link>
                      </td>
                      <td style={TD_STYLE}>
                        {task.projects ? (
                          <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>
                            {task.projects.project_code}
                          </Link>
                        ) : '—'}
                      </td>
                      <td style={TD_STYLE}>{task.assignee?.full_name ?? '—'}</td>
                      <td style={{ ...TD_STYLE, color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                        {task.blocked_reason
                          ? task.blocked_reason.length > 60
                            ? task.blocked_reason.slice(0, 60) + '…'
                            : task.blocked_reason
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Revision requested deliverables */}
        {data.revisionDeliverables.length > 0 && (
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#D97706',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <RotateCcw size={13} />
              Revision Requested
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={TH_STYLE}>Deliverable</th>
                    <th style={TH_STYLE}>Type</th>
                    <th style={TH_STYLE}>Project</th>
                  </tr>
                </thead>
                <tbody>
                  {data.revisionDeliverables.map((d, i) => (
                    <tr
                      key={d.id}
                      style={{
                        borderBottom:
                          i < data.revisionDeliverables.length - 1
                            ? '1px solid var(--color-border)'
                            : undefined,
                        backgroundColor: '#FFFBEB',
                      }}
                    >
                      <td style={TD_STYLE}>
                        <Link href={`/deliverables/${d.id}`} style={ROW_LINK}>
                          {d.name}
                        </Link>
                      </td>
                      <td style={{ ...TD_STYLE, textTransform: 'capitalize' }}>
                        {d.type.replace(/_/g, ' ')}
                      </td>
                      <td style={TD_STYLE}>
                        {d.projects ? (
                          <Link href={`/projects/${d.projects.id}`} style={CODE_LINK}>
                            {d.projects.project_code}
                          </Link>
                        ) : '—'}
                      </td>
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

// ── Urgent Projects section ───────────────────────────────────────────────────

function UrgentProjectsSection({ projects }: { projects: UrgentProject[] }) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <SectionCard title="Urgent Projects">
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={20} />}
          title="No active projects"
          description="Active projects will appear here ordered by due date."
          className="py-8"
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH_STYLE}>Project</th>
                <th style={TH_STYLE}>Client</th>
                <th style={TH_STYLE}>Due</th>
                <th style={TH_STYLE}>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p, i) => {
                const isOverdue = p.target_due_date < today
                return (
                  <tr
                    key={p.id}
                    style={{
                      borderBottom:
                        i < projects.length - 1
                          ? '1px solid var(--color-border)'
                          : undefined,
                    }}
                  >
                    <td style={TD_STYLE}>
                      <div>
                        <Link href={`/projects/${p.id}`} style={ROW_LINK}>
                          {p.name}
                        </Link>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          {p.project_code} · {p.lead?.full_name ?? '—'}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD_STYLE, fontSize: '0.75rem' }}>
                      {p.clients?.client_name ?? '—'}
                    </td>
                    <td
                      style={{
                        ...TD_STYLE,
                        whiteSpace: 'nowrap',
                        color: isOverdue ? '#DC2626' : 'var(--color-text-muted)',
                        fontWeight: isOverdue ? 600 : 400,
                        fontSize: '0.75rem',
                      }}
                    >
                      {isOverdue && <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                      {formatDate(p.target_due_date)}
                    </td>
                    <td style={TD_STYLE}>
                      <ProjectStatusBadge status={p.status} />
                    </td>
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

// ── Upcoming Deadlines section ────────────────────────────────────────────────

function UpcomingDeadlinesSection({ data }: { data: UpcomingDeadlinesData }) {
  const hasData = data.tasks.length > 0 || data.projects.length > 0

  return (
    <SectionCard title="Upcoming Deadlines">
      {!hasData ? (
        <EmptyState
          icon={<CalendarClock size={20} />}
          title="No upcoming deadlines"
          description="Tasks and projects due in the next 2–4 weeks will appear here."
          className="py-8"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {data.tasks.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Tasks — next 14 days
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TH_STYLE}>Task</th>
                      <th style={TH_STYLE}>Project</th>
                      <th style={TH_STYLE}>Assigned To</th>
                      <th style={TH_STYLE}>Due</th>
                      <th style={TH_STYLE}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.tasks.map((task, i) => (
                      <tr
                        key={task.id}
                        style={{
                          borderBottom:
                            i < data.tasks.length - 1
                              ? '1px solid var(--color-border)'
                              : undefined,
                        }}
                      >
                        <td style={TD_STYLE}>
                          <Link href={`/tasks/${task.id}`} style={ROW_LINK}>
                            {task.title}
                          </Link>
                        </td>
                        <td style={TD_STYLE}>
                          {task.projects ? (
                            <Link href={`/projects/${task.projects.id}`} style={CODE_LINK}>
                              {task.projects.project_code}
                            </Link>
                          ) : '—'}
                        </td>
                        <td style={{ ...TD_STYLE, fontSize: '0.75rem' }}>
                          {task.assignee?.full_name ?? '—'}
                        </td>
                        <td style={{ ...TD_STYLE, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {formatDate(task.due_date)}
                        </td>
                        <td style={TD_STYLE}>
                          <TaskStatusBadge status={task.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {data.projects.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Projects — next 28 days
              </p>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={TH_STYLE}>Project</th>
                      <th style={TH_STYLE}>Lead</th>
                      <th style={TH_STYLE}>Due</th>
                      <th style={TH_STYLE}>Priority</th>
                      <th style={TH_STYLE}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.projects.map((p, i) => (
                      <tr
                        key={p.id}
                        style={{
                          borderBottom:
                            i < data.projects.length - 1
                              ? '1px solid var(--color-border)'
                              : undefined,
                        }}
                      >
                        <td style={TD_STYLE}>
                          <div>
                            <Link href={`/projects/${p.id}`} style={ROW_LINK}>
                              {p.name}
                            </Link>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                              {p.project_code}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...TD_STYLE, fontSize: '0.75rem' }}>
                          {p.lead?.full_name ?? '—'}
                        </td>
                        <td style={{ ...TD_STYLE, whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {formatDate(p.target_due_date)}
                        </td>
                        <td style={TD_STYLE}>
                          <PriorityBadge priority={p.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
                        </td>
                        <td style={TD_STYLE}>
                          <ProjectStatusBadge status={p.status} />
                        </td>
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

// ── Recent Activity section ───────────────────────────────────────────────────

const ENTITY_LABELS: Record<string, string> = {
  project:     'Project',
  task:        'Task',
  deliverable: 'Deliverable',
  intake:      'Intake',
}

const ACTION_LABELS: Record<string, string> = {
  created:        'created',
  updated:        'updated',
  status_updated: 'status updated',
  converted:      'converted to project',
}

function RecentActivitySection({ entries }: { entries: ActivityLogEntry[] }) {
  return (
    <SectionCard title="Recent Activity">
      {entries.length === 0 ? (
        <EmptyState
          icon={<Activity size={20} />}
          title="No activity yet"
          description="Activity will appear here as projects, tasks, and deliverables are updated."
          className="py-8"
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {entries.map((entry, i) => {
            const entityLabel = ENTITY_LABELS[entry.entity_type] ?? entry.entity_type
            const actionLabel = ACTION_LABELS[entry.action_type] ?? entry.action_type
            const description = entry.note ?? `${entityLabel} ${actionLabel}`

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '9px 0',
                  borderBottom:
                    i < entries.length - 1
                      ? '1px solid var(--color-border)'
                      : undefined,
                  alignItems: 'flex-start',
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-border)',
                    flexShrink: 0,
                    marginTop: '5px',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: 1.4,
                      margin: 0,
                    }}
                  >
                    {description}
                  </p>
                  <p
                    style={{
                      fontSize: '0.6875rem',
                      color: 'var(--color-text-muted)',
                      margin: '2px 0 0',
                    }}
                  >
                    {entry.actor?.full_name ?? 'System'} · {formatRelativeDate(entry.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SectionCard>
  )
}

// ── Team Workload section ─────────────────────────────────────────────────────

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
        <EmptyState
          icon={<Users size={20} />}
          title="No active workload"
          description="Assigned open tasks will appear here grouped by team member."
          className="py-8"
        />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH_STYLE}>Team Member</th>
                <th style={{ ...TH_STYLE, textAlign: 'right' }}>Open Tasks</th>
                <th style={{ ...TH_STYLE, textAlign: 'right' }}>Overdue</th>
                <th style={TH_STYLE}>Load</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom:
                      i < users.length - 1
                        ? '1px solid var(--color-border)'
                        : undefined,
                  }}
                >
                  <td style={{ ...TD_STYLE, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    {u.full_name}
                  </td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                    {u.openTasks}
                  </td>
                  <td
                    style={{
                      ...TD_STYLE,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: u.overdueTasks > 0 ? '#DC2626' : 'var(--color-text-muted)',
                      fontWeight: u.overdueTasks > 0 ? 600 : 400,
                    }}
                  >
                    {u.overdueTasks > 0 ? u.overdueTasks : '—'}
                  </td>
                  <td style={TD_STYLE}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        borderRadius: '9999px',
                        padding: '2px 8px',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        ...WORKLOAD_BADGE[u.label],
                      }}
                    >
                      {u.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
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
      <PageHeader
        title="Dashboard"
        subtitle="Operational overview — active projects, deadlines, blockers, and team workload."
      />

      {/* ── KPI row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <KpiCard
          label="Active Projects"
          value={kpis.activeProjects}
          icon={<FolderKanban size={18} />}
        />
        <KpiCard
          label="Overdue Tasks"
          value={kpis.overdueTasks}
          icon={<AlertCircle size={18} />}
          description={kpis.overdueTasks > 0 ? 'Needs action' : undefined}
        />
        <KpiCard
          label="Due This Week"
          value={kpis.dueThisWeek}
          icon={<Clock size={18} />}
        />
        <KpiCard
          label="Awaiting Review"
          value={kpis.awaitingReview}
          icon={<FileText size={18} />}
        />
        <KpiCard
          label="Waiting on Client"
          value={kpis.waitingClient}
          icon={<CheckSquare size={18} />}
        />
        <KpiCard
          label="In Revision"
          value={kpis.inRevision}
          icon={<RotateCcw size={18} />}
        />
      </div>

      {/* ── Main two-column grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '20px',
          alignItems: 'start',
        }}
      >
        <NeedsAttentionSection data={attention} />
        <UrgentProjectsSection projects={urgent} />
      </div>

      {/* ── Second two-column grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '20px',
          marginBottom: '20px',
          alignItems: 'start',
        }}
      >
        <UpcomingDeadlinesSection data={deadlines} />
        <RecentActivitySection entries={activity} />
      </div>

      {/* ── Full-width team workload ── */}
      <TeamWorkloadSection users={workload} />
    </div>
  )
}
