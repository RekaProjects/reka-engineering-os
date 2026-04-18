import type { ReactNode } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  AlertCircle,
  Clock,
  FileText,
  CheckSquare,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Activity,
} from 'lucide-react'

import { getSessionProfile } from '@/lib/auth/session'
import { effectiveRole } from '@/lib/auth/permissions'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/card'
import { KpiCard } from '@/components/shared/KpiCard'
import { SectionCard } from '@/components/shared/SectionCard'
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
  title: 'Dashboard — Engineering Agency OS',
}

// ═════════════════════════════════════════════════════════════════════════════
// DashSection — v0-style inline-header card framing for dashboard sections.
// One continuous card surface (no muted header strip), title + description
// inline with optional right-aligned actions, then the content body below.
// ═════════════════════════════════════════════════════════════════════════════

interface DashSectionProps {
  title:        string
  description?: string
  actions?:     ReactNode
  children:     ReactNode
  className?:   string
  bodyClassName?: string
  /**
   * hero    — primary anchor panel (stronger border, subtle tinted surface, no hover lift).
   * default — secondary panel (clean porcelain card).
   * quiet   — supporting panel (compact padding, lighter weight title).
   */
  variant?:     'default' | 'hero' | 'quiet'
}

function DashSection({ title, description, actions, children, className, bodyClassName, variant = 'default' }: DashSectionProps) {
  const isHero  = variant === 'hero'
  const isQuiet = variant === 'quiet'

  return (
    <Card
      className={cn(
        isHero
          ? 'border-[var(--color-border-strong)] bg-gradient-to-b from-[var(--color-surface)] to-[var(--color-surface-subtle)] p-6 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-md)]'
          : isQuiet
            ? 'p-5'
            : 'p-6',
        className
      )}
    >
      <div className={cn('flex items-start justify-between gap-4', isQuiet ? 'mb-3.5' : 'mb-5')}>
        <div className="min-w-0">
          <h2
            className={cn(
              'font-semibold leading-tight tracking-[-0.01em] text-[var(--color-text-primary)]',
              isHero  ? 'text-[1.0625rem]' :
              isQuiet ? 'text-[0.9375rem]' :
              'text-[1rem]'
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-[var(--color-text-muted)]">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div className={bodyClassName}>{children}</div>
    </Card>
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
      <KpiCard variant="dashboard" label="Active Projects" value={kpis.activeProjects} icon={<FolderKanban size={18} />} />
      <KpiCard variant="dashboard" label="Open Tasks"      value={kpis.openTasks}      icon={<CheckSquare  size={18} />} />
      <KpiCard
        variant="dashboard"
        label="Overdue Tasks"
        value={kpis.overdueTasks}
        icon={<AlertCircle size={18} />}
        accent={kpis.overdueTasks > 0 ? 'urgent' : 'none'}
        description={kpis.overdueTasks > 0 ? 'Needs action' : undefined}
      />
      <KpiCard variant="dashboard" label="Due This Week" value={kpis.dueThisWeek} icon={<Clock size={18} />} />
      {kpis.awaitingReview > 0 && (
        <KpiCard variant="dashboard" label="Awaiting Review" value={kpis.awaitingReview} icon={<FileText size={18} />} accent="primary" />
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
    </SectionCard>
  )
}

function ScopedDeliverablesSection({ deliverables, title }: { deliverables: ScopedDeliverable[]; title: string }) {
  return (
    <SectionCard title={title}>
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
    </SectionCard>
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
    <SectionCard title="My Payments">
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
      <div className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-4">
        <div
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
        >
          <Activity className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="m-0 text-[0.875rem] font-semibold text-[var(--color-text-primary)]">
            No recent updates
          </p>
          <p className="mt-1 text-[0.75rem] leading-snug text-[var(--color-text-muted)]">
            Changes to projects, tasks, deliverables, and intakes will stream here as work moves through the pipeline.
          </p>
        </div>
      </div>
    )
  }
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {entries.map((entry) => {
        const description =
          entry.note ??
          `${ENTITY_LABELS[entry.entity_type] ?? entry.entity_type} ${ACTION_LABELS[entry.action_type] ?? entry.action_type}`
        return (
          <div key={entry.id} className="flex items-start gap-3 py-3">
            <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-primary)] opacity-60" />
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[0.8125rem] leading-snug text-[var(--color-text-primary)]">
                {description}
              </p>
              <p className="mt-1 text-[0.6875rem] text-[var(--color-text-muted)]">
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

interface SignalBandSummaryChip { label: string; value: number | string }

function SignalBand({
  riskCount,
  summary,
}: {
  riskCount: number
  summary?:  SignalBandSummaryChip[]
}) {
  const isClear = riskCount === 0
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-[var(--radius-card)] border px-5 py-3.5',
        isClear
          ? 'border-[var(--color-success)]/25 bg-[var(--color-success-subtle)]/60'
          : 'border-[var(--color-danger)]/25  bg-[var(--color-danger-subtle)]'
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
          isClear
            ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] ring-[var(--color-success)]/20'
            : 'bg-[var(--color-danger)]/10  text-[var(--color-danger)]  ring-[var(--color-danger)]/20'
        )}
      >
        {isClear ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
      </div>

      <div className="min-w-0">
        <p
          className={cn(
            'm-0 text-[0.9375rem] font-semibold tracking-[-0.005em]',
            isClear ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
          )}
        >
          {isClear ? 'Pipeline clear' : `${riskCount} risk signal${riskCount === 1 ? '' : 's'}`}
        </p>
        <p className="mt-0.5 text-[0.75rem] leading-snug text-[var(--color-text-secondary)]">
          {isClear
            ? 'No critical blockers flagged in headline metrics.'
            : 'Overdue work, client holds, and revision requests need triage.'}
        </p>
      </div>

      {summary && summary.length > 0 && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {summary.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-baseline gap-1.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-[0.6875rem] text-[var(--color-text-muted)]"
            >
              <span className="text-[0.875rem] font-semibold tabular-nums text-[var(--color-text-primary)]">
                {chip.value}
              </span>
              <span className="uppercase tracking-[0.05em]">{chip.label}</span>
            </span>
          ))}
        </div>
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
          <DashSection title="Assignments">
            <p className="m-0 text-sm text-[var(--color-text-muted)]">
              No project assignments yet. When you are added to projects, this dashboard will populate.
            </p>
          </DashSection>
        </div>
      )
    }

    return (
      <div className="space-y-7">
        <PageHeader
          title="Coordinator Dashboard"
          subtitle="Operational view of your assigned projects — workload, deadlines, and blockers."
        />
        <ScopedKpiRow kpis={data.kpis} />

        <div className="grid grid-cols-12 gap-6">
          {/* Left column (primary) */}
          <div className="col-span-12 space-y-6 xl:col-span-8">
            <DashSection
              variant="hero"
              title="Needs attention"
              description="Ranked queue for your portfolio."
              actions={
                attentionCount > 0 ? (
                  <span className="rounded-full bg-[var(--color-danger-subtle)] px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-danger)]">
                    {attentionCount} flagged
                  </span>
                ) : undefined
              }
            >
              <AttentionQueue attention={attention} waitingClient={waiting} />
            </DashSection>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <DashSection title="Operational health" description="Open tasks by status across your projects.">
                <TaskStatusBarChart counts={pipeline} />
              </DashSection>
              <DashSection title="Deadline pressure" description="Due dates in the next two weeks.">
                <DeadlineBucketsChart buckets={buckets} />
              </DashSection>
            </div>

            <DashSection title="Team workload" description="Open task load on your projects — highest first.">
              <WorkloadBars users={workload} />
            </DashSection>
          </div>

          {/* Right column (supporting) */}
          <div className="col-span-12 space-y-6 xl:col-span-4">
            <DashSection variant="quiet" title="Recent activity" description="Latest changes in your projects.">
              <RecentActivityFeed entries={activity} />
            </DashSection>
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

  const queueSignals = kpis.overdueTasks + kpis.waitingClient + kpis.inRevision
  const totalAttention =
    attention.overdueTasks.length +
    attention.blockedTasks.length +
    attention.revisionDeliverables.length +
    waitingClient.length

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        subtitle="Owner / admin control center — pipeline health, deadlines, cash exposure, and team load."
      />

      {/* A. Signal band — absorbs demoted KPIs (Waiting on Client / In Revision)
           as persistent summary chips so no data is lost. */}
      <SignalBand
        riskCount={queueSignals}
        summary={[
          { label: 'Waiting on client', value: kpis.waitingClient },
          { label: 'In revision',       value: kpis.inRevision },
        ]}
      />

      {/* B. KPI strip — 4 primary headline tiles on xl.
           Taller cards (min-h 156) with 2.125rem values read as real metrics. */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
          accent={kpis.dueThisWeek > 0 ? 'warning' : 'none'}
        />
        <KpiCard
          variant="dashboard"
          label="Awaiting Review"
          value={kpis.awaitingReview}
          icon={<FileText size={20} />}
          accent={kpis.awaitingReview > 0 ? 'primary' : 'none'}
        />
      </div>

      {/* C. Main 12-col grid — 8 / 4 split on xl+ laptops */}
      <div className="grid grid-cols-12 gap-6">
        {/* ── Left column (primary) ───────────────────────────────────── */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <DashSection
            variant="hero"
            title="Needs attention"
            description="Ranked queue — overdue, blocked, revision, and client holds."
            actions={
              totalAttention > 0 ? (
                <span className="rounded-full bg-[var(--color-danger-subtle)] px-2.5 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-danger)]">
                  {totalAttention} flagged
                </span>
              ) : undefined
            }
          >
            <AttentionQueue attention={attention} waitingClient={waitingClient} />
          </DashSection>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DashSection
              title="Operational health"
              description="Where open work sits — flow vs. friction."
            >
              <TaskStatusBarChart counts={pipeline} />
            </DashSection>
            <DashSection
              title="Deadline pressure"
              description="Target dates in the next 14 days."
            >
              <DeadlineBucketsChart buckets={buckets} />
            </DashSection>
          </div>

          <DashSection
            title="Team workload"
            description="Open assignments by person — overload is obvious."
          >
            <WorkloadBars users={workload} />
          </DashSection>
        </div>

        {/* ── Right column (supporting) ───────────────────────────────── */}
        <div className="col-span-12 space-y-6 xl:col-span-4">
          <DashSection
            variant="quiet"
            title="Payment snapshot"
            description="Balance still owed on open rows."
          >
            <PaymentSnapshotCard snapshot={paymentSnapshot} />
          </DashSection>
          <DashSection
            variant="quiet"
            title="Recent activity"
            description="Latest changes across the workspace."
          >
            <RecentActivityFeed entries={activity} />
          </DashSection>
        </div>
      </div>
    </div>
  )
}
