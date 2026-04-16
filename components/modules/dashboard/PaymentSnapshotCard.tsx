import type { PaymentSnapshot } from '@/lib/dashboard/queries'
import { formatIDR } from '@/lib/utils/formatters'
import Link from 'next/link'

export function PaymentSnapshotCard({ snapshot }: { snapshot: PaymentSnapshot }) {
  const { unpaidCount, partialCount, paidCount, totalOutstanding } = snapshot
  const recordTotal = unpaidCount + partialCount + paidCount

  if (recordTotal === 0) {
    return (
      <div
        style={{
          minHeight: '120px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-control)',
          border: '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
          padding: '16px',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 12px', textAlign: 'center' }}>
          No payment records yet. Outstanding balances will appear here once payments exist.
        </p>
        <Link href="/payments" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
          Open payments →
        </Link>
      </div>
    )
  }

  const barTotal = Math.max(1, recordTotal)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Unpaid</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{unpaidCount}</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Partial</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{partialCount}</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Paid</p>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{paidCount}</p>
        </div>
        <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-control)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-subtle)' }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>Outstanding</p>
          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontVariantNumeric: 'tabular-nums' }}>{formatIDR(totalOutstanding)}</p>
        </div>
      </div>

      <div
        role="img"
        aria-label="Payment records by status"
        style={{
          display: 'flex',
          height: '12px',
          borderRadius: '999px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          marginBottom: '10px',
        }}
      >
        {unpaidCount > 0 && (
          <div style={{ width: `${(unpaidCount / barTotal) * 100}%`, backgroundColor: 'var(--color-danger)', minWidth: unpaidCount ? 4 : 0 }} />
        )}
        {partialCount > 0 && (
          <div style={{ width: `${(partialCount / barTotal) * 100}%`, backgroundColor: 'var(--color-warning)', minWidth: partialCount ? 4 : 0 }} />
        )}
        {paidCount > 0 && (
          <div style={{ width: `${(paidCount / barTotal) * 100}%`, backgroundColor: 'var(--color-success)', minWidth: paidCount ? 4 : 0 }} />
        )}
      </div>

      <Link href="/payments" style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
        View payments →
      </Link>
    </div>
  )
}
