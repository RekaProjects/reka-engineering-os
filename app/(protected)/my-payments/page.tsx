import type { CSSProperties } from 'react'
import { Wallet } from 'lucide-react'

import { getSessionProfile } from '@/lib/auth/session'
import { PageHeader }  from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { EmptyState }  from '@/components/shared/EmptyState'
import { PaymentStatusBadge } from '@/components/modules/payments/PaymentStatusBadge'
import { getPaymentsByMember } from '@/lib/payments/queries'
import { formatDate, formatIDR } from '@/lib/utils/formatters'

export const metadata = { title: 'My Payments — Engineering Agency OS' }

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

export default async function MyPaymentsPage() {
  const profile = await getSessionProfile()
  const records = await getPaymentsByMember(profile.id)

  const totalDue  = records.reduce((s, r) => s + Number(r.total_due), 0)
  const totalPaid = records.reduce((s, r) => s + Number(r.total_paid), 0)
  const totalBal  = records.reduce((s, r) => s + Number(r.balance), 0)

  return (
    <div>
      <PageHeader
        title="My Payments"
        subtitle="Your compensation and payment records."
      />

      {/* Summary cards */}
      {records.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <SummaryCard label="Total Due" value={formatIDR(totalDue)} />
          <SummaryCard label="Total Paid" value={formatIDR(totalPaid)} color="var(--color-success)" />
          <SummaryCard label="Outstanding Balance" value={formatIDR(totalBal)} color={totalBal > 0 ? 'var(--color-warning)' : 'var(--color-success)'} />
        </div>
      )}

      <SectionCard>
        {records.length === 0 ? (
          <EmptyState
            icon={<Wallet size={22} />}
            title="No payment records"
            description="Your payment records will appear here once they are created by the admin."
            className="py-12"
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={TH}>Period</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Due</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Paid</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Balance</th>
                  <th style={TH}>Status</th>
                  <th style={TH}>Payment Date</th>
                  <th style={TH}>Method</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom:
                        i < records.length - 1
                          ? '1px solid var(--color-border)'
                          : undefined,
                    }}
                  >
                    <td style={{ ...TD, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                      {r.period_label ?? '—'}
                    </td>
                    <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(r.total_due)}
                    </td>
                    <td style={{ ...TD, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(r.total_paid)}
                    </td>
                    <td style={{
                      ...TD,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      fontWeight: Number(r.balance) > 0 ? 600 : 400,
                      color: Number(r.balance) > 0 ? 'var(--color-warning)' : 'var(--color-text-secondary)',
                    }}>
                      {formatIDR(r.balance)}
                    </td>
                    <td style={TD}>
                      <PaymentStatusBadge status={r.payment_status} />
                    </td>
                    <td style={{ ...TD, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                      {r.payment_date ? formatDate(r.payment_date) : '—'}
                    </td>
                    <td style={{ ...TD, fontSize: '0.75rem', textTransform: 'capitalize' }}>
                      {r.payment_method ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function SummaryCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border:          '1px solid var(--color-border)',
        borderRadius:    'var(--radius-card)',
        padding:         '16px 20px',
      }}
    >
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
        {label}
      </p>
      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: color ?? 'var(--color-text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}
