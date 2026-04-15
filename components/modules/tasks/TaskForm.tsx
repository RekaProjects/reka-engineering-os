'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTask, updateTask } from '@/lib/tasks/actions'
import {
  TASK_STATUS_OPTIONS,
  TASK_CATEGORY_OPTIONS,
  PRIORITY_OPTIONS,
} from '@/lib/constants/options'
import type { Task } from '@/types/database'

interface TaskFormProps {
  mode: 'create' | 'edit'
  task?: Task
  projects: { id: string; name: string; project_code: string }[]
  users: { id: string; full_name: string; email: string; discipline: string | null }[]
  defaultProjectId?: string
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 11px',
  border: '1px solid var(--color-border)',
  borderRadius: '6px',
  fontSize: '0.8125rem',
  color: 'var(--color-text-primary)',
  backgroundColor: 'var(--color-surface)',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--color-text-secondary)',
  marginBottom: '5px',
}

const fieldGroupStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--color-border)',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: 'var(--color-danger)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function TaskForm({ mode, task, projects, users, defaultProjectId }: TaskFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = mode === 'create'
        ? await createTask(formData)
        : await updateTask(task!.id, formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={handleSubmit}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Section: Task Info */}
        <div>
          <p style={sectionTitleStyle}>Task Information</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Title" required>
              <input
                name="title"
                type="text"
                required
                defaultValue={task?.title ?? ''}
                placeholder="e.g. Prepare structural calculation report"
                style={inputStyle}
              />
            </Field>
            <Field label="Description">
              <textarea
                name="description"
                rows={3}
                defaultValue={task?.description ?? ''}
                placeholder="Detailed description of the task…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              />
            </Field>
          </div>
        </div>

        {/* Section: Project & Classification */}
        <div>
          <p style={sectionTitleStyle}>Project & Classification</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={fieldGroupStyle}>
              <Field label="Project" required>
                <select
                  name="project_id"
                  defaultValue={task?.project_id ?? defaultProjectId ?? ''}
                  style={inputStyle}
                  required
                >
                  <option value="">Select a project…</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.project_code})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select
                  name="category"
                  defaultValue={task?.category ?? ''}
                  style={inputStyle}
                >
                  <option value="">No category</option>
                  {TASK_CATEGORY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={{ maxWidth: '50%' }}>
              <Field label="Phase">
                <input
                  name="phase"
                  type="text"
                  defaultValue={task?.phase ?? ''}
                  placeholder="e.g. Schematic Design, Detail Design"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Assignment */}
        <div>
          <p style={sectionTitleStyle}>Assignment</p>
          <div style={fieldGroupStyle}>
            <Field label="Assigned To" required>
              <select
                name="assigned_to_user_id"
                defaultValue={task?.assigned_to_user_id ?? ''}
                style={inputStyle}
                required
              >
                <option value="">Select assignee…</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Reviewer (optional)">
              <select
                name="reviewer_user_id"
                defaultValue={task?.reviewer_user_id ?? ''}
                style={inputStyle}
              >
                <option value="">No reviewer</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </div>

        {/* Section: Timeline */}
        <div>
          <p style={sectionTitleStyle}>Timeline</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={fieldGroupStyle}>
              <Field label="Start Date">
                <input name="start_date" type="date" defaultValue={task?.start_date ?? ''} style={inputStyle} />
              </Field>
              <Field label="Due Date">
                <input name="due_date" type="date" defaultValue={task?.due_date ?? ''} style={inputStyle} />
              </Field>
            </div>
            <div style={fieldGroupStyle}>
              <Field label="Estimated Hours">
                <input name="estimated_hours" type="number" step="0.5" min="0" defaultValue={task?.estimated_hours ?? ''} style={inputStyle} />
              </Field>
              {mode === 'edit' && (
                <Field label="Actual Hours">
                  <input name="actual_hours" type="number" step="0.5" min="0" defaultValue={task?.actual_hours ?? ''} style={inputStyle} />
                </Field>
              )}
            </div>
          </div>
        </div>

        {/* Section: Status & Priority */}
        <div>
          <p style={sectionTitleStyle}>Status & Priority</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={fieldGroupStyle}>
              <Field label="Status" required>
                <select name="status" defaultValue={task?.status ?? 'to_do'} style={inputStyle} required>
                  {TASK_STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority" required>
                <select name="priority" defaultValue={task?.priority ?? 'medium'} style={inputStyle} required>
                  {PRIORITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div style={fieldGroupStyle}>
              <Field label="Progress (%)">
                <input name="progress_percent" type="number" min={0} max={100} defaultValue={task?.progress_percent ?? 0} style={inputStyle} />
              </Field>
              <Field label="Blocked Reason">
                <input name="blocked_reason" type="text" defaultValue={task?.blocked_reason ?? ''} placeholder="Why is this task blocked?" style={inputStyle} />
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Links & Notes */}
        <div>
          <p style={sectionTitleStyle}>Links & Notes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Drive Link">
              <input name="drive_link" type="url" defaultValue={task?.drive_link ?? ''} placeholder="https://drive.google.com/…" style={inputStyle} />
            </Field>
            <Field label="Notes">
              <textarea name="notes" rows={3} defaultValue={task?.notes ?? ''} placeholder="Additional notes…" style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }} />
            </Field>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div role="alert" style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-danger-subtle)',
            border: '1px solid #FECACA',
            borderRadius: '6px',
            color: 'var(--color-danger)',
            fontSize: '0.8125rem',
          }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button type="submit" disabled={isPending} style={{
            padding: '9px 20px',
            backgroundColor: isPending ? 'var(--color-primary-hover)' : 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            fontWeight: 500,
            cursor: isPending ? 'not-allowed' : 'pointer',
          }}>
            {isPending ? 'Saving…' : mode === 'create' ? 'Create Task' : 'Save Changes'}
          </button>
          <button type="button" onClick={() => router.back()} disabled={isPending} style={{
            padding: '9px 16px',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            cursor: 'pointer',
          }}>
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
