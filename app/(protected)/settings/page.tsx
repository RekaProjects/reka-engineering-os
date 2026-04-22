import Link from 'next/link'
import { Plus, Trash2, ToggleLeft, ToggleRight, DollarSign, CreditCard } from 'lucide-react'

import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { PageHeader, SectionHeader } from '@/components/layout/PageHeader'
import { SectionCard } from '@/components/shared/SectionCard'
import { getDomainSummary, getSettingOptionsFull } from '@/lib/settings/queries'
import { upsertSettingOption, deleteSettingOption, toggleSettingOption } from '@/lib/settings/actions'
import { SETTING_DOMAINS, DOMAIN_LABELS, type SettingDomain } from '@/lib/settings/domains'
import { getFxRates } from '@/lib/fx/queries'
import { createFxRate, deleteFxRate } from '@/lib/fx/actions'
import { getPaymentAccounts } from '@/lib/payment-accounts/queries'
import { createPaymentAccount, deletePaymentAccount, togglePaymentAccount } from '@/lib/payment-accounts/actions'
import { cn } from '@/lib/utils/cn'
import { formatDate } from '@/lib/utils/formatters'

export const metadata = { title: 'Settings — ReKa Engineering OS' }

const thClass =
  'border-b border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3.5 py-2.5 text-left text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] whitespace-nowrap'
const tdClass = 'px-3.5 py-2.5 text-[0.8125rem] text-[var(--color-text-secondary)] whitespace-nowrap'
const controlClass =
  'h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-[0.8125rem] text-[var(--color-text-primary)] outline-none transition-colors focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20'

type PageView = 'dropdowns' | 'fx_rates' | 'payment_accounts'

interface PageProps {
  searchParams: Promise<{ domain?: string; view?: string }>
}

export default async function SettingsPage({ searchParams }: PageProps) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin'])

  const params = await searchParams
  const view: PageView =
    params.view === 'fx_rates' ? 'fx_rates'
    : params.view === 'payment_accounts' ? 'payment_accounts'
    : 'dropdowns'

  const activeDomain: SettingDomain = SETTING_DOMAINS.includes(params.domain as SettingDomain)
    ? (params.domain as SettingDomain)
    : 'functional_role'

  const [summary, options, fxRates, paymentAccounts] = await Promise.all([
    getDomainSummary(),
    view === 'dropdowns' ? getSettingOptionsFull(activeDomain) : Promise.resolve([]),
    view === 'fx_rates' ? getFxRates() : Promise.resolve([]),
    view === 'payment_accounts' ? getPaymentAccounts() : Promise.resolve([]),
  ])

  const nextOrder = options.length > 0 ? Math.max(...options.map((o) => o.sort_order)) + 1 : 1

  async function handleDelete(id: string) { 'use server'; await deleteSettingOption(id) }
  async function handleToggle(id: string, current: boolean) { 'use server'; await toggleSettingOption(id, !current) }
  async function handleAdd(formData: FormData) { 'use server'; await upsertSettingOption(formData) }
  async function handleAddFx(formData: FormData) { 'use server'; await createFxRate(formData) }
  async function handleDeleteFx(id: string) { 'use server'; await deleteFxRate(id) }
  async function handleAddAccount(formData: FormData) { 'use server'; await createPaymentAccount(formData) }
  async function handleDeleteAccount(id: string) { 'use server'; await deletePaymentAccount(id) }
  async function handleToggleAccount(id: string, active: boolean) { 'use server'; await togglePaymentAccount(id, active) }

  // ── Top nav tabs ──────────────────────────────────────────
  const topTabs = [
    { id: 'dropdowns', label: 'Dropdowns', icon: null, href: '/settings?view=dropdowns' },
    { id: 'fx_rates', label: 'FX Rates', icon: <DollarSign size={13} />, href: '/settings?view=fx_rates' },
    { id: 'payment_accounts', label: 'Payment Accounts', icon: <CreditCard size={13} />, href: '/settings?view=payment_accounts' },
  ]

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure master data, FX rates, and payment accounts." />

      {/* ── Main view tabs ─────────────────────────────── */}
      <div className="mb-5 flex gap-2 border-b border-[var(--color-border)] pb-0">
        {topTabs.map(tab => {
          const active = view === tab.id
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'inline-flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-[0.8125rem] font-medium no-underline transition-colors',
                active
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════
          VIEW: DROPDOWNS
      ══════════════════════════════════════════════════ */}
      {view === 'dropdowns' && (
        <>
          <div className="mb-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-3">
            <div className="flex flex-wrap gap-2" role="tablist">
              {summary.map((s) => {
                const active = s.domain === activeDomain
                return (
                  <Link
                    key={s.domain}
                    href={`/settings?view=dropdowns&domain=${s.domain}`}
                    role="tab"
                    aria-selected={active}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[0.8125rem] font-medium no-underline transition-colors',
                      active
                        ? 'border-transparent bg-[var(--color-primary)] text-[var(--color-primary-fg)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-muted)]',
                    )}
                  >
                    {DOMAIN_LABELS[s.domain as SettingDomain] ?? s.domain}
                    <span className="min-w-[1.125rem] text-center text-[0.6875rem] opacity-70">{s.count}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          <SectionCard noPadding className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <SectionHeader title={DOMAIN_LABELS[activeDomain]} className="mb-0" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['#', 'Value', 'Label', 'Active', ''].map((h) => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {options.length === 0 && (
                    <tr><td colSpan={5} className={cn(tdClass, 'py-8 text-center text-[var(--color-text-muted)]')}>No options yet.</td></tr>
                  )}
                  {options.map((o) => (
                    <tr key={o.id} className={cn('transition-colors hover:bg-[var(--color-surface-muted)]', !o.is_active && 'opacity-50')}>
                      <td className={cn(tdClass, 'w-12 font-mono text-[0.75rem]')}>{o.sort_order}</td>
                      <td className={cn(tdClass, 'font-mono text-[0.75rem]')}>{o.value}</td>
                      <td className={cn(tdClass, 'font-medium text-[var(--color-text-primary)]')}>{o.label}</td>
                      <td className={cn(tdClass, 'w-20')}>
                        <form action={handleToggle.bind(null, o.id, o.is_active)}>
                          <button type="submit" className={cn('cursor-pointer border-none bg-transparent p-0.5', o.is_active ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]')}>
                            {o.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                        </form>
                      </td>
                      <td className={cn(tdClass, 'w-12 text-right')}>
                        <form action={handleDelete.bind(null, o.id)}>
                          <button type="submit" className="cursor-pointer border-none bg-transparent p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard className="mt-5">
            <SectionHeader title="Add option" />
            <form action={handleAdd} className="flex flex-wrap items-end gap-3">
              <input type="hidden" name="domain" value={activeDomain} />
              <input type="hidden" name="sort_order" value={nextOrder} />
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Value (slug)</label>
                <input name="value" required placeholder="e.g. site_engineer" className={cn(controlClass, 'w-48')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Label</label>
                <input name="label" required placeholder="e.g. Site Engineer" className={cn(controlClass, 'w-48')} />
              </div>
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 text-[0.8125rem] font-medium text-[var(--color-primary-fg)]">
                <Plus size={14} /> Add
              </button>
            </form>
          </SectionCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: FX RATES
      ══════════════════════════════════════════════════ */}
      {view === 'fx_rates' && (
        <>
          <SectionCard noPadding className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <SectionHeader title="Exchange Rates" className="mb-0" />
              <p className="mt-1 text-[0.8125rem] text-[var(--color-text-muted)]">
                Rates are used for USD↔IDR conversions. The most recent entry per currency pair is always used.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['From', 'To', 'Rate', 'Effective Date', 'Notes', ''].map((h) => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {fxRates.length === 0 && (
                    <tr><td colSpan={6} className={cn(tdClass, 'py-8 text-center text-[var(--color-text-muted)]')}>No rates yet. Add one below.</td></tr>
                  )}
                  {fxRates.map((r) => (
                    <tr key={r.id} className="transition-colors hover:bg-[var(--color-surface-muted)]">
                      <td className={cn(tdClass, 'font-mono font-semibold')}>{r.from_currency}</td>
                      <td className={cn(tdClass, 'font-mono font-semibold')}>{r.to_currency}</td>
                      <td className={cn(tdClass, 'font-medium text-[var(--color-text-primary)]')}>
                        {Number(r.rate).toLocaleString('id-ID')}
                      </td>
                      <td className={tdClass}>{formatDate(r.effective_date)}</td>
                      <td className={cn(tdClass, 'text-[var(--color-text-muted)]')}>{r.notes ?? '—'}</td>
                      <td className={cn(tdClass, 'w-12 text-right')}>
                        <form action={handleDeleteFx.bind(null, r.id)}>
                          <button type="submit" className="cursor-pointer border-none bg-transparent p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard className="mt-5">
            <SectionHeader title="Add FX Rate" />
            <form action={handleAddFx} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">From</label>
                <select name="from_currency" defaultValue="USD" className={cn(controlClass, 'w-28')}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">To</label>
                <select name="to_currency" defaultValue="IDR" className={cn(controlClass, 'w-28')}>
                  <option value="IDR">IDR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Rate</label>
                <input name="rate" type="number" required min="0" step="any" placeholder="16400" className={cn(controlClass, 'w-36')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Effective Date</label>
                <input name="effective_date" type="date" required className={cn(controlClass, 'w-40')} defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Notes</label>
                <input name="notes" placeholder="Optional note" className={cn(controlClass, 'w-48')} />
              </div>
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 text-[0.8125rem] font-medium text-[var(--color-primary-fg)]">
                <Plus size={14} /> Add Rate
              </button>
            </form>
          </SectionCard>
        </>
      )}

      {/* ══════════════════════════════════════════════════
          VIEW: PAYMENT ACCOUNTS
      ══════════════════════════════════════════════════ */}
      {view === 'payment_accounts' && (
        <>
          <SectionCard noPadding className="overflow-hidden">
            <div className="border-b border-[var(--color-border)] px-6 py-4">
              <SectionHeader title="Payment Accounts" className="mb-0" />
              <p className="mt-1 text-[0.8125rem] text-[var(--color-text-muted)]">
                Channels where client payments are received (Wise, PayPal, bank accounts).
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Name', 'Type', 'Currency', 'Identifier', 'Active', ''].map((h) => (
                      <th key={h} className={thClass}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {paymentAccounts.length === 0 && (
                    <tr><td colSpan={6} className={cn(tdClass, 'py-8 text-center text-[var(--color-text-muted)]')}>No accounts yet.</td></tr>
                  )}
                  {paymentAccounts.map((acct) => (
                    <tr key={acct.id} className={cn('transition-colors hover:bg-[var(--color-surface-muted)]', !acct.is_active && 'opacity-50')}>
                      <td className={cn(tdClass, 'font-medium text-[var(--color-text-primary)]')}>{acct.name}</td>
                      <td className={cn(tdClass, 'capitalize')}>{acct.account_type}</td>
                      <td className={cn(tdClass, 'font-mono font-semibold')}>{acct.currency}</td>
                      <td className={cn(tdClass, 'text-[var(--color-text-muted)]')}>{acct.account_identifier ?? '—'}</td>
                      <td className={cn(tdClass, 'w-20')}>
                        <form action={handleToggleAccount.bind(null, acct.id, acct.is_active)}>
                          <button type="submit" className={cn('cursor-pointer border-none bg-transparent p-0.5', acct.is_active ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]')}>
                            {acct.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                        </form>
                      </td>
                      <td className={cn(tdClass, 'w-12 text-right')}>
                        <form action={handleDeleteAccount.bind(null, acct.id)}>
                          <button type="submit" className="cursor-pointer border-none bg-transparent p-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                            <Trash2 size={14} />
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <SectionCard className="mt-5">
            <SectionHeader title="Add Payment Account" />
            <form action={handleAddAccount} className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Name</label>
                <input name="name" required placeholder="e.g. Wise USD" className={cn(controlClass, 'w-40')} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Type</label>
                <select name="account_type" className={cn(controlClass, 'w-32')}>
                  <option value="wise">Wise</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank">Bank</option>
                  <option value="ewallet">E-Wallet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Currency</label>
                <select name="currency" className={cn(controlClass, 'w-24')}>
                  <option value="USD">USD</option>
                  <option value="IDR">IDR</option>
                  <option value="EUR">EUR</option>
                  <option value="SGD">SGD</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[0.75rem] font-medium text-[var(--color-text-muted)]">Account Identifier</label>
                <input name="account_identifier" placeholder="email / account no." className={cn(controlClass, 'w-52')} />
              </div>
              <input type="hidden" name="sort_order" value={paymentAccounts.length + 1} />
              <button type="submit" className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[var(--color-primary)] px-4 text-[0.8125rem] font-medium text-[var(--color-primary-fg)]">
                <Plus size={14} /> Add Account
              </button>
            </form>
          </SectionCard>
        </>
      )}
    </div>
  )
}
