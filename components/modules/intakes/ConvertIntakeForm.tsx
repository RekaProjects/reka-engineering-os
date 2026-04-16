'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { convertIntakeToProject } from '@/lib/intakes/convert-action'
import {
  SOURCE_PLATFORMS,
  DISCIPLINES,
  PROJECT_TYPES,
  PRIORITY_OPTIONS,
} from '@/lib/constants/options'
import type { Intake } from '@/types/database'

type OptionPair = { value: string; label: string }

interface ConvertIntakeFormProps {
  intake: Intake & {
    clients: { id: string; client_name: string; client_code: string } | null
  }
  clients: { id: string; client_name: string; client_code: string }[]
  users: { id: string; full_name: string; email: string; discipline: string | null }[]
  disciplineOptions?: OptionPair[]
  projectTypeOptions?: OptionPair[]
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

export function ConvertIntakeForm({ intake, clients, users, disciplineOptions, projectTypeOptions }: ConvertIntakeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const todayString = new Date().toISOString().split('T')[0]

  // Determine client pre-selection
  const hasLinkedClient = !!intake.client_id
  const needsClientSelection = !hasLinkedClient

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await convertIntakeToProject(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="intake_id" value={intake.id} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

        {/* Intake Context Banner */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-primary-subtle)',
            border: '1px solid #BFDBFE',
            borderRadius: '6px',
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--color-primary)', marginBottom: '4px' }}>
            Converting Intake: {intake.intake_code}
          </p>
          <p>
            <strong>{intake.title}</strong>
            {intake.short_brief && (
              <span style={{ display: 'block', marginTop: '4px', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                {intake.short_brief.length > 150 ? intake.short_brief.slice(0, 150) + '…' : intake.short_brief}
              </span>
            )}
          </p>
        </div>

        {/* Section: Project Info */}
        <div>
          <p style={sectionTitleStyle}>Project Information</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field label="Project Name" required>
              <input
                name="name"
                type="text"
                required
                defaultValue={intake.title}
                placeholder="e.g. Steel Frame Design — Warehouse Phase 2"
                style={inputStyle}
              />
            </Field>
            <Field label="Scope Summary">
              <textarea
                name="scope_summary"
                rows={3}
                defaultValue={intake.short_brief ?? ''}
                placeholder="High-level scope description for this project…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              />
            </Field>
          </div>
        </div>

        {/* Section: Client */}
        <div>
          <p style={sectionTitleStyle}>Client</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {needsClientSelection ? (
              <>
                {intake.temp_client_name && (
                  <div
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    Intake prospect name: <strong style={{ color: 'var(--color-text-secondary)' }}>{intake.temp_client_name}</strong>
                    <br />
                    Select an existing client below to associate with this project.
                  </div>
                )}
                <Field label="Client" required>
                  <select
                    name="client_id"
                    defaultValue=""
                    style={inputStyle}
                    required
                  >
                    <option value="">Select a client…</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.client_name} ({c.client_code})
                      </option>
                    ))}
                  </select>
                </Field>
              </>
            ) : (
              <>
                <input type="hidden" name="client_id" value={intake.client_id!} />
                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{intake.clients?.client_name}</span>
                  <span style={{ color: 'var(--color-text-muted)', marginLeft: '6px', fontSize: '0.75rem' }}>
                    {intake.clients?.client_code}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Section: Source & Classification */}
        <div>
          <p style={sectionTitleStyle}>Source & Classification</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={fieldGroupStyle}>
              <Field label="Source" required>
                <select name="source" defaultValue={intake.source} style={inputStyle} required>
                  {SOURCE_PLATFORMS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="External Reference URL">
                <input
                  name="external_reference_url"
                  type="url"
                  defaultValue={intake.external_reference_url ?? ''}
                  placeholder="https://www.upwork.com/jobs/…"
                  style={inputStyle}
                />
              </Field>
            </div>
            <div style={fieldGroupStyle}>
              <Field label="Discipline" required>
                <select name="discipline" defaultValue={intake.discipline} style={inputStyle} required>
                  {(disciplineOptions ?? DISCIPLINES).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="Project Type" required>
                <select name="project_type" defaultValue={intake.project_type} style={inputStyle} required>
                  {(projectTypeOptions ?? PROJECT_TYPES).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>
        </div>

        {/* Section: Timeline */}
        <div>
          <p style={sectionTitleStyle}>Timeline</p>
          <div style={fieldGroupStyle}>
            <Field label="Start Date" required>
              <input
                name="start_date"
                type="date"
                required
                defaultValue={todayString}
                style={inputStyle}
              />
            </Field>
            <Field label="Target Due Date" required>
              <input
                name="target_due_date"
                type="date"
                required
                defaultValue={intake.proposed_deadline ?? ''}
                style={inputStyle}
              />
            </Field>
          </div>
        </div>

        {/* Section: Assignment */}
        <div>
          <p style={sectionTitleStyle}>Assignment</p>
          <div style={fieldGroupStyle}>
            <Field label="Project Lead" required>
              <select
                name="project_lead_user_id"
                defaultValue=""
                style={inputStyle}
                required
              >
                <option value="">Select lead…</option>
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
                defaultValue=""
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

        {/* Section: Priority & Notes */}
        <div>
          <p style={sectionTitleStyle}>Priority & Notes</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ maxWidth: '50%' }}>
              <Field label="Priority" required>
                <select name="priority" defaultValue="medium" style={inputStyle} required>
                  {PRIORITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Internal Notes">
              <textarea
                name="notes_internal"
                rows={3}
                defaultValue={intake.qualification_notes ?? ''}
                placeholder="Internal-only notes, context, risks…"
                style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
              />
            </Field>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            role="alert"
            style={{
              padding: '10px 12px',
              backgroundColor: 'var(--color-danger-subtle)',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              color: 'var(--color-danger)',
              fontSize: '0.8125rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              padding: '9px 20px',
              backgroundColor: isPending ? 'var(--color-primary-hover)' : 'var(--color-primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
            }}
          >
            {isPending ? 'Converting…' : 'Convert to Project'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isPending}
            style={{
              padding: '9px 16px',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  )
}
