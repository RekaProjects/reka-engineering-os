// Date formatting utilities

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const relativeFormatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/** Format a date as "15 Apr 2026" */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  return dateFormatter.format(new Date(date))
}

/** Format a date relative to now, e.g. "3 days ago" */
export function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const diffMs = new Date(date).getTime() - Date.now()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (Math.abs(diffDays) < 1) return 'today'
  if (Math.abs(diffDays) < 7) return relativeFormatter.format(diffDays, 'day')
  if (Math.abs(diffDays) < 30) return relativeFormatter.format(Math.round(diffDays / 7), 'week')
  return relativeFormatter.format(Math.round(diffDays / 30), 'month')
}

/** Truncate long strings with ellipsis */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

/** Get initials from a full name, e.g. "John Doe" → "JD" */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Format a number as IDR currency, e.g. 2500000 → "Rp 2.500.000" */
export function formatIDR(amount: number | string | null | undefined): string {
  if (amount == null || amount === '') return '—'
  const n = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(n)) return '—'
  return idrFormatter.format(n)
}
