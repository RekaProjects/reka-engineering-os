'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { getUsdToIdrRate } from '@/lib/fx/queries'
import { generateNextInvoiceCode, isInvoiceCodeTaken } from '@/lib/invoices/queries'

export async function createInvoice(formData: FormData) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()

  const rawInvoiceCode = (formData.get('invoice_code') as string)?.trim() || ''
  let invoice_code = rawInvoiceCode
  if (!invoice_code) {
    invoice_code = await generateNextInvoiceCode()
  } else if (await isInvoiceCodeTaken(invoice_code)) {
    throw new Error('Invoice code is already in use. Choose a different code or leave blank for auto-generate.')
  }

  const currency = (formData.get('currency') as string) || 'USD'
  const gross_amount = parseFloat(formData.get('gross_amount') as string) || 0
  const platform_fee_pct = parseFloat(formData.get('platform_fee_pct') as string) || 0
  const gateway_fee_pct = parseFloat(formData.get('gateway_fee_pct') as string) || 0

  const platform_fee_amount = gross_amount * platform_fee_pct / 100
  const gateway_fee_amount = (gross_amount - platform_fee_amount) * gateway_fee_pct / 100
  const net_amount = gross_amount - platform_fee_amount - gateway_fee_amount

  const fxRate = currency === 'USD' ? await getUsdToIdrRate() : null

  const { data, error } = await supabase.from('client_invoices').insert({
    invoice_code,
    project_id: (formData.get('project_id') as string) || null,
    client_id: (formData.get('client_id') as string) || null,
    issue_date: formData.get('issue_date') as string,
    due_date: (formData.get('due_date') as string) || null,
    currency,
    gross_amount,
    platform_type: (formData.get('platform_type') as string) || null,
    platform_fee_pct,
    platform_fee_amount,
    gateway_fee_pct,
    gateway_fee_amount,
    net_amount,
    fx_rate_snapshot: fxRate,
    destination_account_id: (formData.get('destination_account_id') as string) || null,
    status: (formData.get('status') as string) || 'draft',
    notes: (formData.get('notes') as string) || null,
    created_by: sp.id,
  }).select().single()

  if (error) throw new Error(error.message)

  // Insert line items if provided
  const lineItemsJson = formData.get('line_items') as string
  if (lineItemsJson && data) {
    const items = JSON.parse(lineItemsJson)
    if (Array.isArray(items) && items.length > 0) {
      await supabase.from('invoice_line_items').insert(
        items.map((item: { description: string; qty: number; unit_price: number }, i: number) => ({
          invoice_id: data.id,
          description: item.description,
          qty: item.qty,
          unit_price: item.unit_price,
          subtotal: item.qty * item.unit_price,
          sort_order: i,
        }))
      )
    }
  }

  revalidatePath('/finance/invoices')
  return data
}

export async function updateInvoiceStatus(id: string, status: string) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin'])

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('client_invoices')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/finance/invoices')
  revalidatePath(`/finance/invoices/${id}`)
}

export async function recordIncomingPayment(formData: FormData) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin'])

  const supabase = await createServerClient()

  const invoice_id = formData.get('invoice_id') as string
  const currency = (formData.get('currency') as string) || 'USD'
  const amount_received = parseFloat(formData.get('amount_received') as string) || 0
  const fxRate = currency === 'USD' ? await getUsdToIdrRate() : null

  const { error } = await supabase.from('incoming_payments').insert({
    invoice_id,
    payment_date: formData.get('payment_date') as string,
    amount_received,
    currency,
    fx_rate_snapshot: fxRate,
    account_id: (formData.get('account_id') as string) || null,
    payment_reference: (formData.get('payment_reference') as string) || null,
    proof_link: (formData.get('proof_link') as string) || null,
    notes: (formData.get('notes') as string) || null,
    recorded_by: sp.id,
  })

  if (error) throw new Error(error.message)

  // Auto-update invoice status based on payment
  const { data: inv } = await supabase
    .from('client_invoices')
    .select('net_amount')
    .eq('id', invoice_id)
    .single()

  const { data: payments } = await supabase
    .from('incoming_payments')
    .select('amount_received')
    .eq('invoice_id', invoice_id)

  if (inv && payments) {
    const totalReceived = payments.reduce((s, p) => s + (p.amount_received ?? 0), 0)
    const newStatus = totalReceived >= inv.net_amount ? 'paid' : 'partial'
    await supabase.from('client_invoices').update({ status: newStatus }).eq('id', invoice_id)
  }

  revalidatePath('/finance/invoices')
  revalidatePath(`/finance/invoices/${invoice_id}`)
}
