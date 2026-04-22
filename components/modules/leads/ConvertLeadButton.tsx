'use client'

import { useState, useTransition, useEffect } from 'react'
import { ArrowRightCircle, X, Loader2 } from 'lucide-react'
import { convertIntakeToProject } from '@/lib/intakes/convert-action'

interface ConvertLeadButtonProps {
  leadId: string
  leadTitle: string
  leadClientName: string
  /** When false, only the form modal is used (e.g. opened from a parent flow). */
  showTrigger?: boolean
  /** Open the convert form on mount. */
  startOpen?: boolean
  /** Called when the form modal is closed (Cancel, X, or overlay) without a successful redirect. */
  onFormClose?: () => void
}

export function ConvertLeadButton({
  leadId,
  leadTitle,
  leadClientName,
  showTrigger = true,
  startOpen = false,
  onFormClose,
}: ConvertLeadButtonProps) {
  const [open, setOpen] = useState(!!startOpen)

  function close() {
    setOpen(false)
    onFormClose?.()
  }

  useEffect(() => {
    if (startOpen) setOpen(true)
  }, [startOpen])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await convertIntakeToProject(formData)
      if (result?.error) {
        setError(result.error)
      }
      // On success, convertIntakeToProject does redirect() server-side
    })
  }

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '5px',
    fontSize: '0.75rem', fontWeight: 500,
    color: 'var(--color-text-muted)',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '36px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-control)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)',
    padding: '0 10px', fontSize: '0.8125rem',
    outline: 'none',
  }

  const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }

  return (
    <>
      {showTrigger ? (
        <button
        onClick={() => { setError(null); setOpen(true) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 10px',
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-primary-fg)',
          border: 'none', borderRadius: 'var(--radius-control)',
          fontSize: '0.75rem', fontWeight: 600,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        <ArrowRightCircle size={13} />
        Convert
        </button>
      ) : null}

      {open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-card)',
            width: '100%', maxWidth: '540px',
            maxHeight: '90vh', overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
                  Convert to Project
                </h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '3px' }}>
                  {leadTitle} · {leadClientName}
                </p>
              </div>
              <button onClick={close} type="button" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {error && (
              <div style={{ padding: '10px 12px', marginBottom: '16px', backgroundColor: 'var(--color-danger-subtle)', border: '1px solid var(--color-danger)', borderRadius: '6px', fontSize: '0.8125rem', color: 'var(--color-danger)' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="hidden" name="intake_id" value={leadId} />

              <div>
                <label style={labelStyle}>Project Name *</label>
                <input name="name" required defaultValue={leadTitle} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Client ID *</label>
                  <input name="client_id" required placeholder="Paste client UUID" style={inputStyle} />
                  <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Find from Clients page
                  </p>
                </div>
                <div>
                  <label style={labelStyle}>Project Lead (User ID) *</label>
                  <input name="project_lead_user_id" required placeholder="Paste user UUID" style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input name="start_date" type="date" style={inputStyle} defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label style={labelStyle}>Target Due Date *</label>
                  <input name="target_due_date" type="date" required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select name="priority" style={selectStyle}>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Source Platform</label>
                  <select name="source_platform" style={selectStyle}>
                    <option value="">— None —</option>
                    <option value="fiverr">Fiverr</option>
                    <option value="upwork">Upwork</option>
                    <option value="direct">Direct</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Internal Notes</label>
                <textarea name="notes_internal" rows={2} placeholder="Optional notes for the team…" style={{ ...inputStyle, height: 'auto', padding: '8px 10px', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={close}
                  style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-control)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)', border: 'none', borderRadius: 'var(--radius-control)', fontSize: '0.8125rem', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.7 : 1 }}
                >
                  {isPending ? <><Loader2 size={14} className="animate-spin" /> Creating…</> : <><ArrowRightCircle size={14} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
