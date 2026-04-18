import { Wallet } from 'lucide-react'
import Link from 'next/link'

import type { PaymentSnapshot } from '@/lib/dashboard/queries'
import { formatIDR } from '@/lib/utils/formatters'
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
    // Preserve the live rhythm at zero: outstanding tile + three status pills
    // (rendered faint) + action link. Feels designed, not blank.
    return (
      <div>
        <div className="mb-3.5 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3.5 py-3">
          <div
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)] ring-1 ring-[var(--color-border)]"
          >
            <Wallet size={15} />
          </div>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">
              Outstanding on unpaid / partial
            </p>
            <p className="mt-1 text-[1.375rem] font-semibold leading-[1.1] tracking-[-0.01em] tabular-nums text-[var(--color-text-primary)]">
              {formatIDR(0)}
            </p>
            <p className="mt-1 text-[0.6875rem] leading-snug text-[var(--color-text-muted)]">
              No payment periods on file yet.
            </p>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-2 opacity-50">
          {[
            { key: 'unpaid',  label: 'Unpaid',  cfg: STATUS_PILL.unpaid  },
            { key: 'partial', label: 'Partial', cfg: STATUS_PILL.partial },
            { key: 'paid',    label: 'Paid',    cfg: STATUS_PILL.paid    },
          ].map(({ key, label, cfg }) => (
            <div
              key={key}
              className={cn(
                'flex items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 py-1.5 ring-1',
                cfg.bg,
                cfg.ring
              )}
            >
              <span className={cn('text-base font-bold leading-none tabular-nums', cfg.text)}>0</span>
              <span className={cn('text-[0.625rem] font-semibold uppercase leading-none tracking-[0.05em]', cfg.text)}>
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          role="img"
          aria-label="No payment records yet"
          className="mb-3 h-2 rounded-full border border-dashed border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
        />

        <Link
          href="/payments"
          className="text-[0.8125rem] font-semibold text-[var(--color-primary)] no-underline hover:underline"
        >
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
