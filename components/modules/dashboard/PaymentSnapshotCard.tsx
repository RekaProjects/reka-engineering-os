import type { PaymentSnapshot } from '@/lib/dashboard/queries'
import { formatIDR } from '@/lib/utils/formatters'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

const STATUS_PILL: Record<string, { text: string; bg: string; ring: string; label: string }> = {
  unpaid:  { text: 'text-[var(--color-danger)]',  bg: 'bg-[var(--color-danger-subtle)]',  ring: 'ring-[var(--color-danger)]/15',  label: 'Unpaid'  },
  partial: { text: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-subtle)]', ring: 'ring-[var(--color-warning)]/15', label: 'Partial' },
  paid:    { text: 'text-[var(--color-success)]', bg: 'bg-[var(--color-success-subtle)]', ring: 'ring-[var(--color-success)]/15', label: 'Paid'    },
}

export function PaymentSnapshotCard({ snapshot }: { snapshot: PaymentSnapshot }) {
  const {
    unpaidCount,
    partialCount,
    paidCount,
    totalOutstanding,
    outstandingUnpaidAmount,
    outstandingPartialAmount,
  } = snapshot
  const recordTotal  = unpaidCount + partialCount + paidCount
  const notFullyPaid = unpaidCount + partialCount

  if (recordTotal === 0) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-2.5 rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-4 py-5">
        <p className="m-0 text-center text-[0.8125rem] text-[var(--color-text-muted)]">
          No payment records yet. When you add periods in Payments, this card will show unpaid / partial / paid
          counts and total balance still owed on open rows.
        </p>
        <Link href="/payments" className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline">
          Open payments →
        </Link>
      </div>
    )
  }

  const barTotal = Math.max(1, recordTotal)
  const showExposureSplit =
    totalOutstanding > 0 && (outstandingUnpaidAmount > 0 || outstandingPartialAmount > 0)

  return (
    <div>
      <p className="mb-3 text-[0.6875rem] leading-snug text-[var(--color-text-muted)]">
        <span className="font-semibold text-[var(--color-text-secondary)]">{recordTotal}</span> payment
        {recordTotal === 1 ? '' : 's'} on file
        {notFullyPaid > 0 ? (
          <>
            {' · '}
            <span className="font-semibold text-[var(--color-text-secondary)]">{notFullyPaid}</span> not fully paid
          </>
        ) : (
          ' · all settled'
        )}
      </p>

      {/* Outstanding amount — headline figure */}
      <div
        className={cn(
          'mb-3.5 rounded-[var(--radius-control)] border px-3.5 py-3',
          totalOutstanding > 0
            ? 'border-[var(--color-danger)]/20 bg-[var(--color-danger-subtle)]'
            : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)]'
        )}
      >
        <p
          className={cn(
            'mb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em]',
            totalOutstanding > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'
          )}
        >
          Outstanding on unpaid / partial
        </p>
        <p
          className={cn(
            'm-0 text-[1.375rem] font-bold leading-[1.1] tracking-[-0.01em] tabular-nums',
            totalOutstanding > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-primary)]'
          )}
        >
          {formatIDR(totalOutstanding)}
        </p>
        {showExposureSplit ? (
          <p className="mt-2 text-[0.6875rem] leading-snug tabular-nums text-[var(--color-text-secondary)]">
            {outstandingUnpaidAmount > 0 && (
              <>
                Unpaid {formatIDR(outstandingUnpaidAmount)}
                {outstandingPartialAmount > 0 ? ' · ' : ''}
              </>
            )}
            {outstandingPartialAmount > 0 && <>Partial {formatIDR(outstandingPartialAmount)}</>}
          </p>
        ) : null}
      </div>

      {/* Status counts — horizontal pills */}
      <div className="mb-3 flex flex-wrap gap-2">
        {[
          { key: 'unpaid',  count: unpaidCount  },
          { key: 'partial', count: partialCount },
          { key: 'paid',    count: paidCount    },
        ].map(({ key, count }) => {
          const cfg = STATUS_PILL[key]
          return (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 ring-1',
                cfg.bg,
                cfg.ring,
                count === 0 && 'opacity-45'
              )}
            >
              <span className={cn('text-base font-bold leading-none tabular-nums', cfg.text)}>
                {count}
              </span>
              <span className={cn('text-[0.625rem] font-semibold uppercase leading-none tracking-[0.05em]', cfg.text)}>
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
        className="mb-3 flex h-2 overflow-hidden rounded-full border border-[var(--color-border)]"
      >
        {unpaidCount > 0 && (
          <div
            className="min-w-[4px] bg-[var(--color-danger)]"
            style={{ width: `${(unpaidCount / barTotal) * 100}%` }}
          />
        )}
        {partialCount > 0 && (
          <div
            className="min-w-[4px] bg-[var(--color-warning)]"
            style={{ width: `${(partialCount / barTotal) * 100}%` }}
          />
        )}
        {paidCount > 0 && (
          <div
            className="min-w-[4px] bg-[var(--color-success)]"
            style={{ width: `${(paidCount / barTotal) * 100}%` }}
          />
        )}
      </div>

      <Link href="/payments" className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline">
        View payments →
      </Link>
    </div>
  )
}
