import type { PaymentSnapshot } from '@/lib/dashboard/queries'
import { formatIDR } from '@/lib/utils/formatters'
import Link from 'next/link'

const STATUS_PILL: Record<string, { color: string; bg: string; label: string }> = {
  unpaid:  { color: '#851E1E', bg: '#F5E8E8', label: 'Unpaid'  },
  partial: { color: '#8A4A08', bg: '#FDF3E7', label: 'Partial' },
  paid:    { color: '#1A6340', bg: '#E8F5EE', label: 'Paid'    },
}

export function PaymentSnapshotCard({ snapshot }: { snapshot: PaymentSnapshot }) {
  const { unpaidCount, partialCount, paidCount, totalOutstanding } = snapshot
  const recordTotal = unpaidCount + partialCount + paidCount

  if (recordTotal === 0) {
    return (
      <div
        style={{
          minHeight:       '120px',
          display:         'flex',
          flexDirection:   'column',
          alignItems:      'center',
          justifyContent:  'center',
          borderRadius:    'var(--radius-control)',
          border:          '1px dashed var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
          padding:         '20px 16px',
          gap:             '10px',
        }}
      >
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0, textAlign: 'center' }}>
          No payment records yet. Outstanding balances will appear here once payments exist.
        </p>
        <Link
          href="/payments"
          style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
        >
          Open payments →
        </Link>
      </div>
    )
  }

  const barTotal = Math.max(1, recordTotal)

  return (
    <div>
      {/* Outstanding amount — headline figure */}
      <div
        style={{
          marginBottom:    '14px',
          padding:         '12px 14px',
          borderRadius:    'var(--radius-control)',
          backgroundColor: totalOutstanding > 0 ? '#F5E8E8' : 'var(--color-surface-subtle)',
          border:          totalOutstanding > 0 ? '1px solid rgba(133,30,30,0.18)' : '1px solid var(--color-border)',
        }}
      >
        <p
          style={{
            fontSize:      '0.625rem',
            fontWeight:    600,
            color:         totalOutstanding > 0 ? '#851E1E' : 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            margin:        '0 0 5px',
          }}
        >
          Outstanding balance
        </p>
        <p
          style={{
            fontSize:           '1.375rem',
            fontWeight:         700,
            color:              totalOutstanding > 0 ? '#851E1E' : 'var(--color-text-primary)',
            margin:             0,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing:      '-0.01em',
            lineHeight:         1.1,
          }}
        >
          {formatIDR(totalOutstanding)}
        </p>
      </div>

      {/* Status counts — horizontal pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {[
          { key: 'unpaid',  count: unpaidCount  },
          { key: 'partial', count: partialCount },
          { key: 'paid',    count: paidCount    },
        ].map(({ key, count }) => {
          const cfg = STATUS_PILL[key]
          return (
            <div
              key={key}
              style={{
                display:         'flex',
                alignItems:      'center',
                gap:             '6px',
                padding:         '6px 10px',
                borderRadius:    'var(--radius-control)',
                backgroundColor: cfg.bg,
                border:          `1px solid ${cfg.color}22`,
                opacity:         count === 0 ? 0.45 : 1,
              }}
            >
              <span
                style={{
                  fontSize:           '1rem',
                  fontWeight:         700,
                  color:              cfg.color,
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight:         1,
                }}
              >
                {count}
              </span>
              <span
                style={{
                  fontSize:      '0.625rem',
                  fontWeight:    600,
                  color:         cfg.color,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  lineHeight:    1,
                }}
              >
                {cfg.label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Payment status bar */}
      <div
        role="img"
        aria-label="Payment records by status"
        style={{
          display:       'flex',
          height:        '8px',
          borderRadius:  '999px',
          overflow:      'hidden',
          border:        '1px solid var(--color-border)',
          marginBottom:  '12px',
        }}
      >
        {unpaidCount > 0 && (
          <div
            style={{
              width:           `${(unpaidCount / barTotal) * 100}%`,
              backgroundColor: '#851E1E',
              minWidth:        4,
            }}
          />
        )}
        {partialCount > 0 && (
          <div
            style={{
              width:           `${(partialCount / barTotal) * 100}%`,
              backgroundColor: '#8A4A08',
              minWidth:        4,
            }}
          />
        )}
        {paidCount > 0 && (
          <div
            style={{
              width:           `${(paidCount / barTotal) * 100}%`,
              backgroundColor: '#1A6340',
              minWidth:        4,
            }}
          />
        )}
      </div>

      <Link
        href="/payments"
        style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
      >
        View payments →
      </Link>
    </div>
  )
}
