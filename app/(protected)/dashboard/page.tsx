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
  CalendarClock,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react'

import { getSessionProfile } from '@/lib/auth/session'
import { effectiveRole } from '@/lib/auth/permissions'
import { PageHeader } from '@/components/layout/PageHeader'
import { KpiCard } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { TaskStatusBadge } from '@/components/modules/tasks/TaskStatusBadge'
import { formatDate, formatIDR, formatRelativeDate } from '@/lib/utils/formatters'

import {
  getDashboardKpis,
  getNeedsAttention,
  getOpenTaskStatusCounts,
  getDeadlineBuckets,
  getPaymentSnapshot,
  getWaitingOnClientProjects,
  getTeamWorkload,
  getNeedsAttentionForProjects,
  getWaitingOnClientProjectsForProjects,
  getOpenTaskStatusCountsForProjects,
  getDeadlineBucketsForProjects,
  getTeamWorkloadForProjects,
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

import { TaskStatusBarChart } from '@/components/modules/dashboard/TaskStatusBarChart'
import { DeadlineBucketsChart } from '@/components/modules/dashboard/DeadlineBucketsChart'
import { AttentionQueue } from '@/components/modules/dashboard/AttentionQueue'
import { PaymentSnapshotCard } from '@/components/modules/dashboard/PaymentSnapshotCard'
import { WorkloadBars } from '@/components/modules/dashboard/WorkloadBars'

export const metadata = {
  title: 'Dashboard — Engineering Agency OS',
}

// ── Shared table styles (scoped role dashboards) ──────────────────────────────

const TH: CSSProperties = {
  padding:         '8px 12px',
  textAlign:       'left',
  fontSize:        '0.6875rem',
  fontWeight:      600,
  color:           'var(--color-text-muted)',
  backgroundColor: 'var(--color-surface-subtle)',
  letterSpacing:   '0.04em',
  textTransform:   'uppercase',
  whiteSpace:      'nowrap',
  borderBottom:    '1px solid var(--color-border)',
}

const TD: CSSProperties = {
  padding:       '8px 12px',
  fontSize:      '0.8125rem',
  color:         'var(--color-text-secondary)',
  verticalAlign: 'middle',
}

const ROW_LINK: CSSProperties = {
  fontWeight:     500,
  color:          'var(--color-text-primary)',
  textDecoration: 'none',
  fontSize:       '0.8125rem',
}

const CODE_LINK: CSSProperties = {
  fontWeight:     500,
  color:          'var(--color-primary)',
  textDecoration: 'none',
  fontSize:       '0.75rem',
}

// ═════════════════════════════════════════════════════════════════════════════
// SHARED SCOPED COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

function ScopedKpiRow({ kpis }: { kpis: ScopedKpis }) {
  return (
    <div
      style={{
        display:             'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(172px, 1fr))',
        gap:                 '14px',
        marginBottom:        '24px',
      }}
    >
      <KpiCard variant="dashboard" label="Active Projects"  value={kpis.activeProjects} icon={<FolderKanban size={20} />} />
      <KpiCard variant="dashboard" label="Open Tasks"       value={kpis.openTasks}      icon={<CheckSquare  size={20} />} />
      <KpiCard
        variant="dashboard"
        label="Overdue Tasks"
        value={kpis.overdueTasks}
        icon={<AlertCircle size={20} />}
        accent={kpis.overdueTasks > 0 ? 'urgent' : 'none'}
        description={kpis.overdueTasks > 0 ? 'Needs action' : undefined}
      />
      <KpiCard variant="dashboard" label="Due This Week"   value={kpis.dueThisWeek}    icon={<Clock        size={20} />} />
      {kpis.awaitingReview > 0 && (
        <KpiCard variant="dashboard" label="Awaiting Review" value={kpis.awaitingReview} icon={<FileText size={20} />} accent="primary" />
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
            <thead>
              <tr>
                <th style={TH}>Task</th>
                <th style={TH}>Project</th>
                <th style={TH}>Due</th>
                <th style={TH}>Priority</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => {
                const overdue = t.due_date && t.due_date < today
                return (
                  <tr key={t.id} style={{ borderBottom: i < tasks.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                    <td style={TD}>
                      <Link href={`/tasks/${t.id}`} style={ROW_LINK}>{t.title}</Link>
                    </td>
                    <td style={TD}>
                      {t.projects
                        ? <Link href={`/projects/${t.projects.id}`} style={CODE_LINK}>{t.projects.project_code}</Link>
                        : '—'}
                    </td>
                    <td
                      style={{
                        ...TD,
                        whiteSpace: 'nowrap',
                        color:      overdue ? 'var(--color-danger)' : 'var(--color-text-muted)',
                        fontWeight: overdue ? 600 : 400,
                        fontSize:   '0.75rem',
                      }}
                    >
                      {overdue && <AlertTriangle size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />}
                      {t.due_date ? formatDate(t.due_date) : '—'}
                    </td>
                    <td style={TD}>
                      <PriorityBadge priority={t.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
                    </td>
                    <td style={TD}>
                      <TaskStatusBadge status={t.status} />
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

function ScopedDeliverablesSection({ deliverables, title }: { deliverables: ScopedDeliverable[]; title: string }) {
  return (
    <SectionCard title={title}>
      {deliverables.length === 0 ? (
        <EmptyState icon={<FileText size={20} />} title="No active deliverables" description="Deliverables will appear here." className="py-8" />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Deliverable</th>
                <th style={TH}>Type</th>
                <th style={TH}>Project</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliverables.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: i < deliverables.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                  <td style={TD}>
                    <Link href={`/deliverables/${d.id}`} style={ROW_LINK}>{d.name}</Link>
                  </td>
                  <td style={{ ...TD, textTransform: 'capitalize' }}>{d.type.replace(/_/g, ' ')}</td>
                  <td style={TD}>
                    {d.projects
                      ? <Link href={`/projects/${d.projects.id}`} style={CODE_LINK}>{d.projects.project_code}</Link>
                      : '—'}
                  </td>
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
    unpaid:  { color: 'var(--color-danger)',  backgroundColor: 'var(--color-danger-subtle)'  },
    partial: { color: 'var(--color-warning)', backgroundColor: 'var(--color-warning-subtle)' },
    paid:    { color: 'var(--color-success)', backgroundColor: 'var(--color-success-subtle)' },
  }
  return (
    <SectionCard title="My Payments">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={TH}>Period</th>
              <th style={{ ...TH, textAlign: 'right' }}>Due</th>
              <th style={{ ...TH, textAlign: 'right' }}>Paid</th>
              <th style={{ ...TH, textAlign: 'right' }}>Balance</th>
              <th style={TH}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid var(--color-border)' : undefined }}>
                <td style={{ ...TD, fontWeight: 500, color: 'var(--color-text-primary)' }}>{p.period_label ?? '—'}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatIDR(p.total_due)}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{formatIDR(p.total_paid)}</td>
                <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: p.balance > 0 ? 600 : 400 }}>{formatIDR(p.balance)}</td>
                <td style={TD}>
                  <span
                    style={{
                      display:       'inline-flex',
                      borderRadius:  'var(--radius-pill)',
                      padding:       '2px 10px',
                      fontSize:      '0.6875rem',
                      fontWeight:    600,
                      textTransform: 'capitalize',
                      letterSpacing: '0.01em',
                      ...(PAYMENT_STATUS_STYLE[p.payment_status] ?? {}),
                    }}
                  >
                    {p.payment_status}
                  </span>
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

// ── Recent activity feed ─────────────────────────────────────────────────────

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

function RecentActivityFeed({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div
        style={{
          padding:         '14px 16px',
          borderRadius:    'var(--radius-control)',
          border:          '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.5 }}>
          No recent updates. Activity will appear as work moves through the pipeline.
        </p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {entries.map((entry, i) => {
        const description =
          entry.note ??
          `${ENTITY_LABELS[entry.entity_type] ?? entry.entity_type} ${ACTION_LABELS[entry.action_type] ?? entry.action_type}`
        return (
          <div
            key={entry.id}
            style={{
              display:     'flex',
              gap:         '9px',
              padding:     '7px 0',
              borderBottom: i < entries.length - 1 ? '1px solid var(--color-border)' : undefined,
              alignItems:  'flex-start',
            }}
          >
            <div
              style={{
                width:           '6px',
                height:          '6px',
                borderRadius:    '50%',
                backgroundColor: 'var(--color-primary)',
                flexShrink:      0,
                marginTop:       '5px',
                opacity:         0.45,
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.35, margin: 0 }}>
                {description}
              </p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: '2px 0 0' }}>
                {entry.actor?.full_name ?? 'System'} · {formatRelativeDate(entry.created_at)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Admin operational signal band ────────────────────────────────────────────

function SignalBand({ riskCount }: { riskCount: number }) {
  const isClear = riskCount === 0
  return (
    <div
      style={{
        display:         'flex',
        alignItems:      'center',
        gap:             '9px',
        padding:         '9px 14px',
        borderRadius:    'var(--radius-control)',
        backgroundColor: isClear ? 'var(--color-surface-subtle)' : 'var(--color-danger-subtle)',
        border:          isClear
          ? '1px solid var(--color-border)'
          : '1px solid rgba(133,30,30,0.20)',
        marginBottom:    '28px',
      }}
    >
      {isClear ? (
        <>
          <CheckCircle2 size={14} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1 }}>
            Pipeline clear — no critical blockers flagged in headline metrics.
          </span>
        </>
      ) : (
        <>
          <ShieldAlert size={14} style={{ color: 'var(--color-danger)', flexShrink: 0 }} />
          <span
            style={{
              fontSize:   '0.8125rem',
              fontWeight: 600,
              color:      'var(--color-danger)',
              lineHeight: 1,
            }}
          >
            {riskCount} risk signal{riskCount === 1 ? '' : 's'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1 }}>
            — overdue work, client holds, and revision requests need triage.
          </span>
        </>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default async function DashboardPage() {
  const profile = await getSessionProfile()
  const role    = effectiveRole(profile.system_role)

  // ── Member ──────────────────────────────────────────────────────────────────
  if (role === 'member') {
    const data = await getMemberDashboard(profile.id)
    return (
      <div>
        <PageHeader
          title="My Dashboard"
          subtitle={`${profile.full_name} · Your tasks, deliverables, and payment status.`}
          className="mb-6"
        />
        <ScopedKpiRow kpis={data.kpis} />
        <div style={{ marginBottom: '20px' }}>
          <ScopedTasksSection tasks={data.tasks} title="My Open Tasks" />
        </div>
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: '2fr 1fr',
            gap:                 '20px',
            alignItems:          'start',
          }}
        >
          <ScopedDeliverablesSection deliverables={data.deliverables} title="My Deliverables" />
          <ScopedPaymentsSection payments={data.payments} />
        </div>
      </div>
    )
  }

  // ── Reviewer ────────────────────────────────────────────────────────────────
  if (role === 'reviewer') {
    const data = await getReviewerDashboard(profile.id)
    return (
      <div>
        <PageHeader
          title="Review Dashboard"
          subtitle="Queue and items waiting for your sign-off."
          className="mb-6"
        />
        <ScopedKpiRow kpis={data.kpis} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>
          <ScopedTasksSection      tasks={data.tasks}             title="Review Tasks"       />
          <ScopedDeliverablesSection deliverables={data.deliverables} title="Review Deliverables" />
        </div>
      </div>
    )
  }

  // ── Coordinator ─────────────────────────────────────────────────────────────
  if (role === 'coordinator') {
    const data = await getCoordinatorDashboard(profile.id)
    const [pipeline, buckets, attention, waiting, workload, activity] = await Promise.all([
      getOpenTaskStatusCountsForProjects(data.projectIds),
      getDeadlineBucketsForProjects(data.projectIds),
      getNeedsAttentionForProjects(data.projectIds),
      getWaitingOnClientProjectsForProjects(data.projectIds),
      getTeamWorkloadForProjects(data.projectIds),
      getRecentActivity(14),
    ])

    const attentionCount =
      attention.overdueTasks.length +
      attention.blockedTasks.length +
      attention.revisionDeliverables.length +
      waiting.length

    return (
      <div>
        <PageHeader
          title="Coordinator Dashboard"
          subtitle="Operational view of your assigned projects — workload, deadlines, and blockers."
          className="mb-6"
        />
        <ScopedKpiRow kpis={data.kpis} />

        {data.projectIds.length === 0 ? (
          <SectionCard title="Assignments">
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
              No project assignments yet. When you are added to projects, this dashboard will populate.
            </p>
          </SectionCard>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
              <SectionCard title="Operational health" description="Open tasks by status across your projects.">
                <TaskStatusBarChart counts={pipeline} />
              </SectionCard>
              <SectionCard title="Deadline pressure" description="Due dates in the next two weeks.">
                <DeadlineBucketsChart buckets={buckets} />
              </SectionCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
              <SectionCard
                title="Needs attention"
                description="Ranked queue for your portfolio."
                actions={
                  attentionCount > 0 ? (
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-danger)' }}>
                      {attentionCount} flagged
                    </span>
                  ) : undefined
                }
              >
                <AttentionQueue attention={attention} waitingClient={waiting} />
              </SectionCard>
              <SectionCard title="Recent activity" description="Latest changes in your projects.">
                <RecentActivityFeed entries={activity} />
              </SectionCard>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', marginBottom: '20px', alignItems: 'start' }}>
              <SectionCard title="Team workload" description="Open task load on your projects — highest first.">
                <WorkloadBars users={workload} />
              </SectionCard>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <ScopedTasksSection       tasks={data.tasks}             title="Open tasks"        />
                <ScopedDeliverablesSection deliverables={data.deliverables} title="Active deliverables" />
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // ── Admin / Owner ────────────────────────────────────────────────────────────
  const [kpis, attention, pipeline, buckets, paymentSnapshot, waitingClient, activity, workload] =
    await Promise.all([
      getDashboardKpis(),
      getNeedsAttention(),
      getOpenTaskStatusCounts(),
      getDeadlineBuckets(),
      getPaymentSnapshot(),
      getWaitingOnClientProjects(),
      getRecentActivity(18),
      getTeamWorkload(),
    ])

  const queueSignals = kpis.overdueTasks + kpis.waitingClient + kpis.inRevision
  const totalAttention =
    attention.overdueTasks.length +
    attention.blockedTasks.length +
    attention.revisionDeliverables.length +
    waitingClient.length

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Owner / admin control center — pipeline health, deadlines, cash exposure, and team load."
        className="mb-3"
      />

      {/* Operational signal band */}
      <SignalBand riskCount={queueSignals} />

      {/* A. KPI strip */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap:                 '14px',
          marginBottom:        '28px',
        }}
      >
        <KpiCard
          variant="dashboard"
          label="Active Projects"
          value={kpis.activeProjects}
          icon={<FolderKanban size={20} />}
          accent="primary"
        />
        <KpiCard
          variant="dashboard"
          label="Open Tasks"
          value={kpis.openTasks}
          icon={<CheckSquare size={20} />}
          accent={kpis.overdueTasks > 0 ? 'urgent' : 'none'}
          description={kpis.overdueTasks > 0 ? `${kpis.overdueTasks} overdue` : undefined}
        />
        <KpiCard
          variant="dashboard"
          label="Due This Week"
          value={kpis.dueThisWeek}
          icon={<Clock size={20} />}
        />
        <KpiCard
          variant="dashboard"
          label="Awaiting Review"
          value={kpis.awaitingReview}
          icon={<FileText size={20} />}
          accent={kpis.awaitingReview > 0 ? 'primary' : 'none'}
        />
        <KpiCard
          variant="dashboard"
          label="Waiting on Client"
          value={kpis.waitingClient}
          icon={<CalendarClock size={20} />}
          accent={kpis.waitingClient > 0 ? 'warning' : 'none'}
        />
        <KpiCard
          variant="dashboard"
          label="In Revision"
          value={kpis.inRevision}
          icon={<RotateCcw size={20} />}
          accent={kpis.inRevision > 0 ? 'warning' : 'none'}
        />
      </div>

      {/* B. Main overview row — Operational health + Deadline pressure */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 380px',
          gap:                 '20px',
          marginBottom:        '20px',
          alignItems:          'start',
        }}
      >
        <SectionCard
          title="Operational health"
          description="Where open work sits in the pipeline — flow vs. friction."
        >
          <TaskStatusBarChart counts={pipeline} />
        </SectionCard>
        <SectionCard
          title="Deadline pressure"
          description="Tasks and projects with target dates in the next 14 days."
        >
          <DeadlineBucketsChart buckets={buckets} />
        </SectionCard>
      </div>

      {/* C. Action / risk row — Needs attention + Payment snapshot */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 380px',
          gap:                 '20px',
          marginBottom:        '20px',
          alignItems:          'start',
        }}
      >
        <SectionCard
          title="Needs attention"
          description="Ranked queue — overdue, blocked, revision, and client holds."
          actions={
            totalAttention > 0 ? (
              <span
                style={{
                  fontSize:        '0.6875rem',
                  fontWeight:      700,
                  color:           'var(--color-danger)',
                  backgroundColor: 'var(--color-danger-subtle)',
                  padding:         '3px 9px',
                  borderRadius:    'var(--radius-pill)',
                  letterSpacing:   '0.02em',
                }}
              >
                {totalAttention} flagged
              </span>
            ) : undefined
          }
        >
          <AttentionQueue attention={attention} waitingClient={waitingClient} />
        </SectionCard>
        <SectionCard
          title="Payment snapshot"
          description="Balance still owed on unpaid and partial rows, status mix, and link to Payments — not full finance."
        >
          <PaymentSnapshotCard snapshot={paymentSnapshot} />
        </SectionCard>
      </div>

      {/* D. People / activity row — Team workload + Recent activity */}
      <div
        style={{
          display:             'grid',
          gridTemplateColumns: '1fr 380px',
          gap:                 '20px',
          marginBottom:        '20px',
          alignItems:          'start',
        }}
      >
        <SectionCard
          title="Team workload"
          description="Open assignments by person — overload is obvious."
        >
          <WorkloadBars users={workload} />
        </SectionCard>
        <SectionCard
          title="Recent activity"
          description="What changed recently across the workspace."
        >
          <RecentActivityFeed entries={activity} />
        </SectionCard>
      </div>
    </div>
  )
}
