import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  AlertCircle,
  Clock,
  FileText,
  CheckSquare,
  AlertTriangle,
  CalendarClock,
  Activity,
} from 'lucide-react'

import { getSessionProfile } from '@/lib/auth/session'
import { effectiveRole } from '@/lib/auth/permissions'
import { PageHeader, SectionHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { KpiCard, KpiStrip } from '@/components/shared/KpiCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { TaskStatusBadge } from '@/components/modules/tasks/TaskStatusBadge'
import { formatDate, formatIDR, formatRelativeDate } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

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
  title: 'Dashboard — ReKa Engineering OS',
}

// ═════════════════════════════════════════════════════════════════════════════
// SectionShell — Card + SectionHeader (Stage 2 v0 pattern)
// ═════════════════════════════════════════════════════════════════════════════

interface SectionShellProps {
  title:        string
  description?: string
  actions?:     ReactNode
  children:     ReactNode
  className?:   string
}

function SectionShell({ title, description, actions, children, className }: SectionShellProps) {
  return (
    <div
      className={cn('rounded-[var(--radius-card)] border p-5', className)}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[0.8125rem]" style={{ color: 'var(--color-text-muted)' }}>
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}

// ── Shared table classes (scoped role dashboards) ────────────────────────────

const TH_CLASS = 'whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]'
const TD_CLASS = 'align-middle px-3 py-2.5 text-[0.8125rem] text-[var(--color-text-secondary)]'
const ROW_LINK_CLASS  = 'text-[0.8125rem] font-medium text-[var(--color-text-primary)] no-underline hover:text-[var(--color-primary)]'
const CODE_LINK_CLASS = 'text-xs font-medium text-[var(--color-primary)] no-underline hover:underline'

// ═════════════════════════════════════════════════════════════════════════════
// SHARED SCOPED COMPONENTS
// ═════════════════════════════════════════════════════════════════════════════

function ScopedKpiRow({ kpis }: { kpis: ScopedKpis }) {
  return (
    <KpiStrip className="lg:grid-cols-5 xl:grid-cols-5">
      <KpiCard title="Active Projects" value={kpis.activeProjects} icon={FolderKanban} />
      <KpiCard title="Open Tasks" value={kpis.openTasks} icon={CheckSquare} />
      <KpiCard
        title="Overdue Tasks"
        value={kpis.overdueTasks}
        icon={AlertCircle}
        variant={kpis.overdueTasks > 0 ? 'danger' : 'default'}
      />
      <KpiCard
        title="Due This Week"
        value={kpis.dueThisWeek}
        icon={Clock}
        variant={kpis.dueThisWeek > 0 ? 'warning' : 'default'}
      />
      <KpiCard
        title="Awaiting Review"
        value={kpis.awaitingReview}
        icon={FileText}
        accent={kpis.awaitingReview > 0 ? 'primary' : 'none'}
      />
    </KpiStrip>
  )
}

function ScopedTasksSection({ tasks, title }: { tasks: ScopedTask[]; title: string }) {
  const today = new Date().toISOString().split('T')[0]
  return (
    <Card className="p-5">
      <SectionHeader title={title} />
      <div className="space-y-3">
      {tasks.length === 0 ? (
        <EmptyState icon={<CheckSquare size={20} />} title="No open tasks" description="You're all caught up." className="py-8" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH_CLASS}>Task</th>
                <th className={TH_CLASS}>Project</th>
                <th className={TH_CLASS}>Due</th>
                <th className={TH_CLASS}>Priority</th>
                <th className={TH_CLASS}>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => {
                const overdue = t.due_date && t.due_date < today
                return (
                  <tr key={t.id} className={cn(i < tasks.length - 1 && 'border-b border-[var(--color-border)]')}>
                    <td className={TD_CLASS}>
                      <Link href={`/tasks/${t.id}`} className={ROW_LINK_CLASS}>{t.title}</Link>
                    </td>
                    <td className={TD_CLASS}>
                      {t.projects
                        ? <Link href={`/projects/${t.projects.id}`} className={CODE_LINK_CLASS}>{t.projects.project_code}</Link>
                        : '—'}
                    </td>
                    <td
                      className={cn(
                        TD_CLASS,
                        'whitespace-nowrap text-xs',
                        overdue ? 'font-semibold text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
                      )}
                    >
                      {overdue && <AlertTriangle size={11} className="mr-1 inline-block align-middle" />}
                      {t.due_date ? formatDate(t.due_date) : '—'}
                    </td>
                    <td className={TD_CLASS}>
                      <PriorityBadge priority={t.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
                    </td>
                    <td className={TD_CLASS}>
                      <TaskStatusBadge status={t.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </Card>
  )
}

function ScopedDeliverablesSection({ deliverables, title }: { deliverables: ScopedDeliverable[]; title: string }) {
  return (
    <Card className="p-5">
      <SectionHeader title={title} />
      <div className="space-y-3">
      {deliverables.length === 0 ? (
        <EmptyState icon={<FileText size={20} />} title="No active deliverables" description="Deliverables will appear here." className="py-8" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={TH_CLASS}>Deliverable</th>
                <th className={TH_CLASS}>Type</th>
                <th className={TH_CLASS}>Project</th>
                <th className={TH_CLASS}>Status</th>
              </tr>
            </thead>
            <tbody>
              {deliverables.map((d, i) => (
                <tr key={d.id} className={cn(i < deliverables.length - 1 && 'border-b border-[var(--color-border)]')}>
                  <td className={TD_CLASS}>
                    <Link href={`/deliverables/${d.id}`} className={ROW_LINK_CLASS}>{d.name}</Link>
                  </td>
                  <td className={cn(TD_CLASS, 'capitalize')}>{d.type.replace(/_/g, ' ')}</td>
                  <td className={TD_CLASS}>
                    {d.projects
                      ? <Link href={`/projects/${d.projects.id}`} className={CODE_LINK_CLASS}>{d.projects.project_code}</Link>
                      : '—'}
                  </td>
                  <td className={cn(TD_CLASS, 'capitalize')}>{d.status.replace(/_/g, ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </Card>
  )
}

function ScopedPaymentsSection({ payments }: { payments: ScopedPayment[] }) {
  if (payments.length === 0) return null
  const PILL_CLASS: Record<string, string> = {
    unpaid:  'text-[var(--color-danger)]  bg-[var(--color-danger-subtle)]',
    partial: 'text-[var(--color-warning)] bg-[var(--color-warning-subtle)]',
    paid:    'text-[var(--color-success)] bg-[var(--color-success-subtle)]',
  }
  return (
    <Card className="p-5">
      <SectionHeader title="My Payments" />
      <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={TH_CLASS}>Period</th>
              <th className={cn(TH_CLASS, 'text-right')}>Due</th>
              <th className={cn(TH_CLASS, 'text-right')}>Paid</th>
              <th className={cn(TH_CLASS, 'text-right')}>Balance</th>
              <th className={TH_CLASS}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, i) => (
              <tr key={p.id} className={cn(i < payments.length - 1 && 'border-b border-[var(--color-border)]')}>
                <td className={cn(TD_CLASS, 'font-medium text-[var(--color-text-primary)]')}>{p.period_label ?? '—'}</td>
                <td className={cn(TD_CLASS, 'text-right tabular-nums')}>{formatIDR(p.total_due)}</td>
                <td className={cn(TD_CLASS, 'text-right tabular-nums')}>{formatIDR(p.total_paid)}</td>
                <td className={cn(TD_CLASS, 'text-right tabular-nums', p.balance > 0 && 'font-semibold')}>{formatIDR(p.balance)}</td>
                <td className={TD_CLASS}>
                  <span
                    className={cn(
                      'inline-flex rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[0.6875rem] font-semibold capitalize tracking-[0.01em]',
                      PILL_CLASS[p.payment_status] ?? ''
                    )}
                  >
                    {p.payment_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <Link href="/my-payments" className="text-[0.8125rem] font-medium text-[var(--color-primary)] no-underline hover:underline">
          View all payments →
        </Link>
      </div>
      </div>
    </Card>
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
      <div className="flex items-center gap-3 py-2">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        >
          <Activity className="h-4 w-4" />
        </div>
        <p className="m-0 text-[0.8125rem] leading-snug text-[var(--color-text-muted)]">
          No recent updates — activity across projects, tasks, and deliverables will stream here.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const description =
          entry.note ??
          `${ENTITY_LABELS[entry.entity_type] ?? entry.entity_type} ${ACTION_LABELS[entry.action_type] ?? entry.action_type}`
        return (
          <div key={entry.id} className="flex items-start gap-2.5 rounded-md px-2 py-2">
            <div
              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
            />
            <div className="min-w-0">
              <p className="text-[0.8125rem] leading-snug" style={{ color: 'var(--color-text-primary)' }}>
                {description}
              </p>
              <p className="text-[0.6875rem]" style={{ color: 'var(--color-text-muted)' }}>
                {entry.actor?.full_name ?? 'System'} · {formatRelativeDate(entry.created_at)}
              </p>
            </div>
          </div>
        )
      })}
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
      <div className="space-y-6">
        <PageHeader
          title="My Dashboard"
          subtitle={`${profile.full_name} · Your tasks, deliverables, and payment status.`}
        />
        <ScopedKpiRow kpis={data.kpis} />
        <ScopedTasksSection tasks={data.tasks} title="My Open Tasks" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <ScopedDeliverablesSection deliverables={data.deliverables} title="My Deliverables" />
          </div>
          <ScopedPaymentsSection payments={data.payments} />
        </div>
      </div>
    )
  }

  // ── Reviewer ────────────────────────────────────────────────────────────────
  if (role === 'reviewer') {
    const data = await getReviewerDashboard(profile.id)
    return (
      <div className="space-y-6">
        <PageHeader
          title="Review Dashboard"
          subtitle="Queue and items waiting for your sign-off."
        />
        <ScopedKpiRow kpis={data.kpis} />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ScopedTasksSection        tasks={data.tasks}                title="Review Tasks"        />
          <ScopedDeliverablesSection deliverables={data.deliverables}  title="Review Deliverables" />
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

    if (data.projectIds.length === 0) {
      return (
        <div className="space-y-6">
          <PageHeader
            title="Coordinator Dashboard"
            subtitle="Operational view of your assigned projects — workload, deadlines, and blockers."
          />
          <ScopedKpiRow kpis={data.kpis} />
          <SectionShell title="Assignments">
            <p className="m-0 text-sm text-[var(--color-text-muted)]">
              No project assignments yet. When you are added to projects, this dashboard will populate.
            </p>
          </SectionShell>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <PageHeader
          title="Coordinator Dashboard"
          subtitle="Operational view of your assigned projects — workload, deadlines, and blockers."
        />
        <ScopedKpiRow kpis={data.kpis} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <SectionShell
              title="Needs Attention"
              description="Ranked queue for your portfolio."
              actions={<FlagCount count={attentionCount} />}
            >
              <AttentionQueue attention={attention} waitingClient={waiting} />
            </SectionShell>

            <SectionShell title="Tasks by status">
              <TaskStatusBarChart counts={pipeline} />
            </SectionShell>

            <SectionShell title="Deadline pressure">
              <DeadlineBucketsChart buckets={buckets} />
            </SectionShell>

            <SectionShell title="Team workload" description="Open task load — highest first.">
              <WorkloadBars users={workload} />
            </SectionShell>
          </div>

          <div className="space-y-4 xl:col-span-4">
            <SectionShell title="Recent activity">
              <RecentActivityFeed entries={activity} />
            </SectionShell>
            <ScopedTasksSection        tasks={data.tasks}               title="Open tasks"          />
            <ScopedDeliverablesSection deliverables={data.deliverables} title="Active deliverables" />
          </div>
        </div>
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

  const attentionCount =
    attention.overdueTasks.length +
    attention.blockedTasks.length +
    attention.revisionDeliverables.length +
    waitingClient.length

  return (
    <div className="page-content animate-fade-in space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Owner / admin control center — pipeline health, deadlines, cash exposure, and team load."
      />

      {/* ── KPI Strip ─────────────────────────────────────────── */}
      <KpiStrip>
        <KpiCard
          title="Active Projects"
          value={kpis.activeProjects}
          icon={FolderKanban}
          accent="primary"
        />
        <KpiCard
          title="Overdue Tasks"
          value={kpis.overdueTasks}
          icon={AlertCircle}
          variant={kpis.overdueTasks > 0 ? 'danger' : 'default'}
        />
        <KpiCard
          title="In Review"
          value={kpis.awaitingReview}
          icon={FileText}
          subtitle="Deliverables"
        />
        <KpiCard
          title="Revision Needed"
          value={kpis.inRevision}
          icon={AlertTriangle}
          variant={kpis.inRevision > 0 ? 'warning' : 'default'}
          subtitle="Projects"
        />
        <KpiCard
          title="Waiting on Client"
          value={kpis.waitingClient}
          icon={Clock}
          subtitle="Projects"
        />
        <KpiCard
          title="Pending Payments"
          value={formatIDR(paymentSnapshot.totalOutstanding)}
          icon={CalendarClock}
          variant={paymentSnapshot.unpaidCount > 0 ? 'warning' : 'default'}
          subtitle={`${paymentSnapshot.unpaidCount + paymentSnapshot.partialCount} payments`}
        />
      </KpiStrip>

      {/* ── Main grid (content + sidebar) ─────────────────────── */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">

        {/* Left column — main content */}
        <div className="space-y-6">
          <SectionShell
            title="Needs Attention"
            description="Overdue tasks, blocked work, revision requests, and client holds."
            actions={<FlagCount count={attentionCount} />}
          >
            <AttentionQueue attention={attention} waitingClient={waitingClient} />
          </SectionShell>

          <SectionShell title="Tasks by status">
            <TaskStatusBarChart counts={pipeline} />
          </SectionShell>

          <SectionShell title="Deadline pressure">
            <DeadlineBucketsChart buckets={buckets} />
          </SectionShell>

          <SectionShell title="Team workload" description="Open task load — highest first.">
            <WorkloadBars users={workload} />
          </SectionShell>
        </div>

        {/* Right column — sidebar widgets */}
        <div className="space-y-4">
          <SectionShell title="Payment snapshot">
            <PaymentSnapshotCard snapshot={paymentSnapshot} />
          </SectionShell>

          <SectionShell title="Recent activity">
            <RecentActivityFeed entries={activity} />
          </SectionShell>

          <SectionShell title="Upcoming deadlines">
            <UpcomingDeadlinesList waitingClient={waitingClient} />
          </SectionShell>
        </div>

      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
// Supporting components
// ═════════════════════════════════════════════════════════════════════════════

function FlagCount({ count }: { count: number }) {
  if (count === 0) {
    return (
      <span className="rounded-full bg-[var(--color-success-subtle)] px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-success)]">
        Clear
      </span>
    )
  }
  return (
    <span className="rounded-full bg-[var(--color-danger-subtle)] px-2.5 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-danger)]">
      {count} flagged
    </span>
  )
}

// Upcoming deadlines — small compact list for the right rail.
// Uses the waiting-client projects as the closest truthful source of
// dated project items. Sparse data collapses to a single quiet line.
function UpcomingDeadlinesList({
  waitingClient,
}: {
  waitingClient: Awaited<ReturnType<typeof getWaitingOnClientProjects>>
}) {
  const items = waitingClient.slice(0, 4)
  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3 py-2">
        <div
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]"
        >
          <CalendarClock className="h-4 w-4" />
        </div>
        <p className="m-0 text-[0.8125rem] leading-snug text-[var(--color-text-muted)]">
          No deadlines on hold — dated client-side holds will appear here.
        </p>
      </div>
    )
  }
  const today = Date.now()
  return (
    <div className="space-y-2">
      {items.map((p) => {
        const due = new Date(p.target_due_date).getTime()
        const days = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
        const urgent = days <= 7
        return (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] px-3 py-2.5 text-inherit no-underline transition-colors hover:bg-[var(--color-surface-subtle)]"
          >
            <div className="min-w-0">
              <p className="m-0 truncate text-[0.8125rem] font-medium text-[var(--color-text-primary)]">
                {p.name}
              </p>
              <p className="mt-0.5 truncate text-[0.6875rem] text-[var(--color-text-muted)]">
                {p.project_code} · {p.clients?.client_name ?? 'Client'}
              </p>
            </div>
            <span
              className={cn(
                'shrink-0 text-[0.75rem] font-medium tabular-nums',
                urgent ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
              )}
            >
              {days <= 0 ? 'Due' : `${days}d`}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
