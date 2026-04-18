'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import type { WorkloadUser } from '@/lib/dashboard/queries'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const CHART_CONFIG: ChartConfig = {
  openTasks:    { label: 'Open',    color: 'var(--color-chart-1)' },
  overdueTasks: { label: 'Overdue', color: 'var(--color-chart-5)' },
}

function firstName(full: string): string {
  const parts = full.trim().split(/\s+/)
  return parts[0] ?? full
}

export function WorkloadBars({ users }: { users: WorkloadUser[] }) {
  if (users.length === 0) {
    return (
      <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-5">
        <p className="m-0 text-[0.8125rem] text-[var(--color-text-muted)]">
          No open assignments. Task load will appear here as work is assigned.
        </p>
      </div>
    )
  }

  const data = users.slice(0, 10).map((u) => ({
    id:           u.id,
    name:         firstName(u.full_name),
    full_name:    u.full_name,
    openTasks:    u.openTasks,
    overdueTasks: u.overdueTasks,
    label:        u.label,
  }))

  const atRisk = users.filter((u) => u.label === 'Overloaded' || u.label === 'High')

  return (
    <div>
      <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full">
        <BarChart data={data} barGap={4} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="var(--color-border)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={28}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--color-surface-muted)', opacity: 0.5 }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Bar dataKey="openTasks"    fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} barSize={16} />
          <Bar dataKey="overdueTasks" fill="var(--color-chart-5)" radius={[4, 4, 0, 0]} barSize={16} />
        </BarChart>
      </ChartContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-[var(--color-border)] pt-3 text-[0.75rem] text-[var(--color-text-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[var(--color-chart-1)]" />
          Open tasks
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[var(--color-chart-5)]" />
          Overdue
        </span>
        {atRisk.length > 0 && (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--color-danger-subtle)] px-2.5 py-1 text-[0.6875rem] font-semibold text-[var(--color-danger)]">
            {atRisk.length} at risk
          </span>
        )}
      </div>
    </div>
  )
}
