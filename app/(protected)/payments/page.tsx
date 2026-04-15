import Link from 'next/link'
import { Wallet, Plus } from 'lucide-react'
import type { CSSProperties } from 'react'

import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import { PaymentStatusBadge } from '@/components/modules/payments/PaymentStatusBadge'
import { getPaymentRecords } from '@/lib/payments/queries'
import { formatDate, formatIDR } from '@/lib/utils/formatters'
import { PAYMENT_METHOD_OPTIONS } from '@/lib/constants/options'

export const metadata = { title: 'Payments — Engineering Agency OS' }

const METHOD_LABEL = Object.fromEntries(PAYMENT_METHOD_OPTIONS.map((o) => [o.value, o.label]))

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

export default async function PaymentsListPage() {
  const _sp = await getSessionProfile()
  requireRole(_sp.system_role, ['admin'])

  const records = await getPaymentRecords()

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Payment tracking for team members and freelancers."
        actions={
          <Link
            href="/payments/new"
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
            Add Payment
          </Link>
        }
      />

      <SectionCard noPadding>
        {records.length === 0 ? (
          <EmptyState
            icon={<Wallet size={22} />}
            title="No payment records yet"
            description="Create a payment record to track what has been paid to members."
            action={
              <Link
                href="/payments/new"
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
                Add Payment
              </Link>
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Member', 'Period', 'Due', 'Paid', 'Balance', 'Method', 'Date', 'Status', ''].map((h) => (
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
                      <td style={TD}>
                        {r.period_label ?? '—'}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {formatIDR(r.total_due)}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {formatIDR(r.total_paid)}
                      </td>
                      <td style={{ ...TD, fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: Number(r.balance) > 0 ? '#B54708' : 'var(--color-text-primary)' }}>
                        {formatIDR(r.balance)}
                      </td>
                      <td style={TD}>
                        {r.payment_method ? METHOD_LABEL[r.payment_method] ?? r.payment_method : '—'}
                      </td>
                      <td style={TD}>
                        {formatDate(r.payment_date)}
                      </td>
                      <td style={TD}>
                        <PaymentStatusBadge status={r.payment_status} />
                      </td>
                      <td style={{ ...TD, textAlign: 'right' }}>
                        <Link
                          href={`/payments/${r.id}`}
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
