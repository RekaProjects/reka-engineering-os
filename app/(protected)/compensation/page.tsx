import Link from 'next/link'
import { Receipt, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'

import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import { CompensationStatusBadge } from '@/components/modules/compensation/CompensationStatusBadge'
import { getCompensationRecords } from '@/lib/compensation/queries'
import { formatDate, formatIDR } from '@/lib/utils/formatters'
import { WORK_BASIS_OPTIONS } from '@/lib/constants/options'

export const metadata = { title: 'Compensation — Engineering Agency OS' }

const RATE_LABEL = Object.fromEntries(WORK_BASIS_OPTIONS.map((o) => [o.value, o.label]))

const TH: CSSProperties = {
  padding: '9px 14px',
  textAlign: 'left',
  fontSize: '0.6875rem',
  fontWeight: 600,
  color: 'var(--color-text-muted)',
  backgroundColor: 'var(--color-surface-subtle)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  borderBottom: '1px solid var(--color-border)',
}

const TD: CSSProperties = {
  padding: '10px 14px',
  fontSize: '0.8125rem',
  color: 'var(--color-text-secondary)',
  whiteSpace: 'nowrap',
}

export default async function CompensationListPage() {
  const _sp = await getSessionProfile()
  requireRole(_sp.system_role, ['admin'])

  const records = await getCompensationRecords()

  return (
    <div>
      <PageHeader
        title="Compensation"
        subtitle="Work-based compensation records for team members and freelancers."
        actions={
          <Link
            href="/compensation/new"
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
            Add Record
          </Link>
        }
      />

      <SectionCard noPadding>
        {records.length === 0 ? (
          <EmptyState
            icon={<Receipt size={22} />}
            title="No compensation records yet"
            description="Create a compensation record to track what is owed for work done."
            action={
              <Link
                href="/compensation/new"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                }}
              >
                <Plus size={14} aria-hidden="true" />
                Add Record
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Member', 'Project', 'Rate Type', 'Qty', 'Rate', 'Subtotal', 'Period', 'Status', ''].map((h) => (
                    <th key={h} style={TH}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((r, idx) => {
                  const isLast = idx === records.length - 1
                  return (
                    <tr
                      key={r.id}
                      style={{ borderBottom: isLast ? undefined : '1px solid var(--color-border)' }}
                      className="hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td style={{ ...TD, maxWidth: '180px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {r.member?.full_name ?? '—'}
                        </span>
                      </td>
                      <td style={{ ...TD, maxWidth: '200px' }}>
                        {r.project?.name ?? '—'}
                      </td>
                      <td style={TD}>
                        {RATE_LABEL[r.rate_type] ?? r.rate_type}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {Number(r.qty)}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {formatIDR(r.rate_amount)}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        {formatIDR(r.subtotal_amount)}
                      </td>
                      <td style={TD}>
                        {r.period_label ?? (r.work_date ? formatDate(r.work_date) : '—')}
                      </td>
                      <td style={TD}>
                        <CompensationStatusBadge status={r.status} />
                      </td>
                      <td style={{ ...TD, textAlign: 'right' }}>
                        <Link
                          href={`/compensation/${r.id}`}
                          style={{ fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}
                        >
                          View
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
    </div>
  )
}
