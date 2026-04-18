'use client'

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import type { OpenTaskStatusCounts, TaskPipelineStatus } from '@/lib/dashboard/queries'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'

const ORDER: TaskPipelineStatus[] = ['to_do', 'in_progress', 'review', 'revision', 'blocked']

const LABELS: Record<TaskPipelineStatus, string> = {
  to_do:       'To do',
  in_progress: 'In progress',
  review:      'Review',
  revision:    'Revision',
  blocked:     'Blocked',
}

const FILL: Record<TaskPipelineStatus, string> = {
  to_do:       'var(--color-chart-4)',
  in_progress: 'var(--color-chart-1)',
  review:      'var(--color-chart-3)',
  revision:    'var(--color-chart-5)',
  blocked:     'var(--color-chart-5)',
}

const CHART_CONFIG: ChartConfig = {
  count:       { label: 'Tasks' },
  to_do:       { label: LABELS.to_do,       color: 'var(--color-chart-4)' },
  in_progress: { label: LABELS.in_progress, color: 'var(--color-chart-1)' },
  review:      { label: LABELS.review,      color: 'var(--color-chart-3)' },
  revision:    { label: LABELS.revision,    color: 'var(--color-chart-5)' },
  blocked:     { label: LABELS.blocked,     color: 'var(--color-chart-5)' },
}

export function TaskStatusBarChart({ counts }: { counts: OpenTaskStatusCounts }) {
  const total = ORDER.reduce((s, k) => s + (counts[k] ?? 0), 0)

  if (total === 0) {
    return (
      <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-5">
        <p className="m-0 text-[0.8125rem] text-[var(--color-text-muted)]">
          No open tasks in the pipeline.
        </p>
      </div>
    )
  }

  const data = ORDER.map((key) => ({
    key,
    status: LABELS[key],
    count:  counts[key] ?? 0,
    fill:   FILL[key],
  }))

  return (
    <div>
      <ChartContainer config={CHART_CONFIG} className="h-[200px] w-full">
        <BarChart data={data} layout="vertical" barSize={18} margin={{ top: 4, right: 16, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="status"
            tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
            tickLine={false}
            axisLine={false}
            width={84}
          />
          <ChartTooltip cursor={{ fill: 'var(--color-surface-muted)', opacity: 0.5 }} content={<ChartTooltipContent hideLabel />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>

      <div className="mt-3 flex items-center justify-between border-t border-[var(--color-border)] pt-2.5">
        <span className="text-xs text-[var(--color-text-muted)]">Total open tasks</span>
        <span className="text-sm font-bold tabular-nums text-[var(--color-text-primary)]">
          {total}
        </span>
      </div>
    </div>
  )
}
