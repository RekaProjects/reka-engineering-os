import type { CSSProperties } from 'react'
import Link from 'next/link'
import { UserSquare2, Plus, Mail, Clock } from 'lucide-react'

import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader }     from '@/components/layout/PageHeader'
import { SectionCard }    from '@/components/shared/SectionCard'
import { EmptyState }     from '@/components/shared/EmptyState'
import { AvailabilityBadge } from '@/components/modules/team/AvailabilityBadge'
import { WorkerTypeBadge }   from '@/components/modules/team/WorkerTypeBadge'
import { CopyLinkButton }    from '@/components/modules/onboarding/CopyLinkButton'
import { getTeamMembers }    from '@/lib/team/queries'
import { getPendingInvites } from '@/lib/invites/queries'
import { revokeInvite as _revokeInvite } from '@/lib/invites/actions'
import { formatDate, formatIDR } from '@/lib/utils/formatters'
import { SYSTEM_ROLES, RATE_TYPE_OPTIONS } from '@/lib/constants/options'
import { getSettingOptions } from '@/lib/settings/queries'

export const metadata = { title: 'Team — Engineering Agency OS' }

const SYSTEM_ROLE_LABEL = Object.fromEntries(SYSTEM_ROLES.map((r) => [r.value, r.label]))
const RATE_LABEL = Object.fromEntries(RATE_TYPE_OPTIONS.map((r) => [r.value, r.label]))

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const TH: CSSProperties = {
  padding:         '9px 14px',
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
  padding:   '10px 14px',
  fontSize:  '0.8125rem',
  color:     'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
}

async function handleRevokeInvite(id: string) {
  'use server'
  await _revokeInvite(id)
}

/** Prefer IDR via design-system formatter; other currencies use locale currency when valid */
function formatRateAmount(n: number | null | undefined, currencyCode: string | null | undefined): string | null {
  if (n == null || n === undefined) return null
  const num = Number(n)
  if (Number.isNaN(num)) return null
  const code = (currencyCode || 'IDR').toUpperCase()
  if (code === 'IDR') return formatIDR(num)
  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${num.toLocaleString('id-ID')} ${code}`
  }
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string }>
}) {
  const _sp = await getSessionProfile()
  requireRole(_sp.system_role, ['admin'])

  const { invited } = await searchParams
  const [members, pendingInvites, funcOpts, wtOpts] = await Promise.all([
    getTeamMembers(),
    getPendingInvites(),
    getSettingOptions('functional_role'),
    getSettingOptions('worker_type'),
  ])
  const FUNCTIONAL_LABEL = Object.fromEntries(funcOpts.map((r) => [r.value, r.label]))
  const WORKER_TYPE_LABEL = Object.fromEntries(wtOpts.map((r) => [r.value, r.label]))

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Internal team members, freelancers, and subcontractors."
        actions={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link
              href="/team/invite"
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '6px',
                padding:         '8px 14px',
                backgroundColor: 'var(--color-surface)',
                border:          '1px solid var(--color-border)',
                borderRadius:    'var(--radius-control)',
                fontSize:        '0.8125rem',
                fontWeight:      500,
                color:           'var(--color-text-primary)',
                textDecoration:  'none',
              }}
            >
              <Mail size={14} aria-hidden="true" />
              Invite
            </Link>
            <Link
              href="/team/new"
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                gap:             '6px',
                padding:         '8px 14px',
                backgroundColor: 'var(--color-primary)',
                color:           'var(--color-primary-fg)',
                borderRadius:    'var(--radius-control)',
                fontSize:        '0.8125rem',
                fontWeight:      500,
                textDecoration:  'none',
              }}
            >
              <Plus size={14} aria-hidden="true" />
              Add Member
            </Link>
          </div>
        }
      />

      <SectionCard noPadding>
        {members.length === 0 ? (
          <EmptyState
            icon={<UserSquare2 size={22} />}
            title="No team members yet"
            description="Add your first team member or freelancer to get started."
            action={
              <Link
                href="/team/new"
                style={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  gap:             '6px',
                  padding:         '8px 16px',
                  backgroundColor: 'var(--color-primary)',
                  color:           'var(--color-primary-fg)',
                  borderRadius:    'var(--radius-control)',
                  fontSize:        '0.8125rem',
                  fontWeight:      500,
                  textDecoration:  'none',
                }}
              >
                <Plus size={14} aria-hidden="true" />
                Add Member
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Name', 'Type', 'Role', 'Discipline / Function', 'Availability', 'Rate', 'Status', ''].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const isLast = idx === members.length - 1
                  const approved = formatRateAmount(m.approved_rate, m.currency_code)
                  const expected = formatRateAmount(m.expected_rate, m.currency_code)
                  const rateLabel = approved ?? (expected ? `~${expected}` : '—')

                  const rateType = m.rate_type
                    ? RATE_LABEL[m.rate_type] ?? m.rate_type.replace(/_/g, ' ')
                    : ''

                  const funcLabel = m.functional_role
                    ? FUNCTIONAL_LABEL[m.functional_role] ?? m.functional_role
                    : null

                  const activeColor =
                    m.active_status === 'active'   ? 'var(--color-success)' :
                    m.active_status === 'inactive' ? 'var(--color-text-muted)' :
                    'var(--color-neutral)'

                  return (
                    <tr
                      key={m.id}
                      style={{ borderBottom: isLast ? undefined : '1px solid var(--color-border)' }}
                      className="hover:bg-[var(--color-surface-muted)] transition-colors"
                    >
                      {/* Name */}
                      <td style={{ ...TD, maxWidth: '200px' }}>
                        <Link
                          href={`/team/${m.id}`}
                          style={{
                            fontWeight:     500,
                            color:          'var(--color-text-primary)',
                            textDecoration: 'none',
                          }}
                          className="hover:underline"
                        >
                          {m.full_name}
                        </Link>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '1px' }}>
                          {m.email}
                        </div>
                      </td>

                      {/* Worker type */}
                      <td style={TD}>
                        {m.worker_type
                          ? <WorkerTypeBadge type={m.worker_type} />
                          : <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>

                      {/* System role */}
                      <td style={{ ...TD, textTransform: 'capitalize' }}>
                        {m.system_role ?? '—'}
                      </td>

                      {/* Discipline / function */}
                      <td style={TD}>
                        <span style={{ textTransform: 'capitalize' }}>{m.discipline ?? ''}</span>
                        {m.discipline && funcLabel && <span style={{ color: 'var(--color-text-muted)' }}> · </span>}
                        {funcLabel}
                        {!m.discipline && !funcLabel && <span style={{ color: 'var(--color-text-muted)' }}>—</span>}
                      </td>

                      {/* Availability */}
                      <td style={TD}>
                        <AvailabilityBadge status={m.availability_status} />
                      </td>

                      {/* Rate */}
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {rateLabel}
                        {(approved || expected) && rateType && (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.6875rem', display: 'block', marginTop: '2px' }}>
                            {rateType}
                          </span>
                        )}
                      </td>

                      {/* Active status */}
                      <td style={{ ...TD, color: activeColor, textTransform: 'capitalize', fontWeight: 500 }}>
                        {m.active_status}
                      </td>

                      {/* Actions */}
                      <td style={{ ...TD, textAlign: 'right' }}>
                        <Link
                          href={`/team/${m.id}/edit`}
                          style={{
                            fontSize:       '0.75rem',
                            color:          'var(--color-primary)',
                            textDecoration: 'none',
                            fontWeight:     500,
                          }}
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* ── Pending Invites ──────────────────────────────────── */}
      {pendingInvites.length > 0 && (
        <SectionCard
          title="Pending Invites"
          actions={
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              {pendingInvites.length} pending
            </span>
          }
          noPadding
        >
          {/* New invite banner */}
          {invited && (
            <div style={{
              padding:      '10px 16px',
              borderBottom: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-info-subtle)',
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
            }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-info)', fontWeight: 500 }}>
                Invite created. Copy the link below and share it with the invited person.
              </span>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Email', 'Name', 'Role', 'Type', 'Expires', 'Invite Link', ''].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pendingInvites.map((inv, idx) => {
                  const isLast = idx === pendingInvites.length - 1
                  const inviteUrl = `${APP_URL}/onboarding/${inv.token}`
                  const isHighlighted = invited === inv.token
                  return (
                    <tr
                      key={inv.id}
                      style={{
                        borderBottom:    isLast ? undefined : '1px solid var(--color-border)',
                        backgroundColor: isHighlighted ? 'var(--color-info-subtle)' : undefined,
                      }}
                    >
                      <td style={TD}>{inv.email}</td>
                      <td style={{ ...TD, color: 'var(--color-text-muted)' }}>{inv.full_name ?? '—'}</td>
                      <td style={{ ...TD, textTransform: 'capitalize' }}>
                        {inv.system_role ? SYSTEM_ROLE_LABEL[inv.system_role] ?? inv.system_role : '—'}
                      </td>
                      <td style={TD}>
                        {inv.worker_type ? WORKER_TYPE_LABEL[inv.worker_type] ?? inv.worker_type : '—'}
                      </td>
                      <td style={{ ...TD, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={11} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                        {formatDate(inv.expires_at)}
                      </td>
                      <td style={{ ...TD, minWidth: '320px' }}>
                        <CopyLinkButton url={inviteUrl} />
                      </td>
                      <td style={{ ...TD, textAlign: 'right' }}>
                        <form action={handleRevokeInvite.bind(null, inv.id)}>
                          <button
                            type="submit"
                            style={{
                              fontSize:        '0.75rem',
                              color:           'var(--color-danger)',
                              background:      'none',
                              border:          'none',
                              cursor:          'pointer',
                              padding:         '0',
                              fontWeight:      500,
                              fontFamily:      'inherit',
                            }}
                          >
                            Revoke
                          </button>
                        </form>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
