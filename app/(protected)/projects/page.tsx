import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProjectStatusBadge } from '@/components/modules/projects/ProjectStatusBadge'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { getProjects } from '@/lib/projects/queries'
import type { ProjectWithRelations } from '@/lib/projects/queries'
import { formatDate } from '@/lib/utils/formatters'
import { FolderKanban, Plus } from 'lucide-react'

export const metadata = { title: 'Projects — Engineering Agency OS' }

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; discipline?: string; priority?: string }>
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const projects = await getProjects({
    search: params.search,
    status: params.status,
    discipline: params.discipline,
    priority: params.priority,
  }).catch(() => [] as ProjectWithRelations[])

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Active and historical engineering project work."
        actions={
          <Link
            href="/projects/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            <Plus size={14} aria-hidden="true" />
            New Project
          </Link>
        }
      />

      {/* Filters */}
      <form method="GET" style={{ marginBottom: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          name="search"
          type="search"
          defaultValue={params.search ?? ''}
          placeholder="Search projects…"
          style={{
            padding: '7px 11px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            minWidth: '220px',
            backgroundColor: 'var(--color-surface)',
          }}
        />
        <select
          name="status"
          defaultValue={params.status ?? ''}
          style={{
            padding: '7px 11px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="ready_to_start">Ready to Start</option>
          <option value="ongoing">Ongoing</option>
          <option value="internal_review">Internal Review</option>
          <option value="waiting_client">Waiting Client</option>
          <option value="in_revision">In Revision</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          name="discipline"
          defaultValue={params.discipline ?? ''}
          style={{
            padding: '7px 11px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <option value="">All Disciplines</option>
          <option value="mechanical">Mechanical</option>
          <option value="civil">Civil</option>
          <option value="structural">Structural</option>
          <option value="electrical">Electrical</option>
          <option value="other">Other</option>
        </select>
        <select
          name="priority"
          defaultValue={params.priority ?? ''}
          style={{
            padding: '7px 11px',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <button
          type="submit"
          style={{
            padding: '7px 14px',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            color: 'var(--color-text-secondary)',
          }}
        >
          Filter
        </button>
        {(params.search || params.status || params.discipline || params.priority) && (
          <Link
            href="/projects"
            style={{
              padding: '7px 14px',
              fontSize: '0.8125rem',
              color: 'var(--color-text-muted)',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <SectionCard noPadding>
        <ProjectsTable projects={projects} />
      </SectionCard>
    </div>
  )
}

function ProjectsTable({ projects }: { projects: ProjectWithRelations[] }) {
  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderKanban size={22} />}
        title="No projects yet"
        description="Create your first project to start tracking engineering work, deadlines, and team assignments."
        action={
          <Link
            href="/projects/new"
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            Create First Project
          </Link>
        }
      />
    )
  }

  const headers = ['Project Code', 'Project Name', 'Client', 'Discipline', 'Lead', 'Priority', 'Status', 'Due Date', 'Progress', 'Waiting On']

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
            {headers.map(h => (
              <th
                key={h}
                style={{
                  padding: '10px 14px',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-text-muted)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map((project, idx) => (
            <tr
              key={project.id}
              style={{
                borderBottom: idx < projects.length - 1 ? '1px solid var(--color-border)' : undefined,
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
              }}
              className="hover:bg-[#F8FAFC]"
            >
              {/* Code */}
              <td style={{ padding: '10px 14px' }}>
                <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    {project.project_code}
                  </span>
                </Link>
              </td>
              {/* Name */}
              <td style={{ padding: '10px 14px' }}>
                <Link href={`/projects/${project.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <p style={{
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    fontSize: '0.8125rem',
                    maxWidth: '260px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {project.name}
                  </p>
                </Link>
              </td>
              {/* Client */}
              <td style={{ padding: '10px 14px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {project.clients?.client_name ?? '—'}
              </td>
              {/* Discipline */}
              <td style={{ padding: '10px 14px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {project.discipline}
              </td>
              {/* Lead */}
              <td style={{ padding: '10px 14px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {project.lead?.full_name ?? '—'}
              </td>
              {/* Priority */}
              <td style={{ padding: '10px 14px' }}>
                <PriorityBadge priority={project.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'} />
              </td>
              {/* Status */}
              <td style={{ padding: '10px 14px' }}>
                <ProjectStatusBadge status={project.status} />
              </td>
              {/* Due Date */}
              <td style={{ padding: '10px 14px', fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                {formatDate(project.target_due_date)}
              </td>
              {/* Progress */}
              <td style={{ padding: '10px 14px', minWidth: '90px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ProgressBar value={project.progress_percent} height={5} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                    {project.progress_percent}%
                  </span>
                </div>
              </td>
              {/* Waiting On */}
              <td style={{ padding: '10px 14px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                {project.waiting_on === 'none' ? '—' : project.waiting_on}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
