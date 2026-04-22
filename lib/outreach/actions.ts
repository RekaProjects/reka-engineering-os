'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getSessionProfile, requireRole } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

export async function createOutreachCompany(formData: FormData) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()
  const { error } = await supabase.from('outreach_companies').insert({
    company_name: formData.get('company_name') as string,
    contact_person: (formData.get('contact_person') as string) || null,
    contact_channel: (formData.get('contact_channel') as string) || null,
    contact_value: (formData.get('contact_value') as string) || null,
    status: (formData.get('status') as string) || 'to_contact',
    last_contact_date: (formData.get('last_contact_date') as string) || null,
    next_followup_date: (formData.get('next_followup_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
    created_by: sp.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/outreach')
}

export async function updateOutreachStatus(id: string, status: string) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('outreach_companies')
    .update({ status, last_contact_date: status !== 'to_contact' ? new Date().toISOString().split('T')[0] : undefined })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/outreach')
}

export async function updateOutreachCompany(id: string, formData: FormData) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()
  const { error } = await supabase.from('outreach_companies').update({
    company_name: formData.get('company_name') as string,
    contact_person: (formData.get('contact_person') as string) || null,
    contact_channel: (formData.get('contact_channel') as string) || null,
    contact_value: (formData.get('contact_value') as string) || null,
    status: (formData.get('status') as string) || 'to_contact',
    last_contact_date: (formData.get('last_contact_date') as string) || null,
    next_followup_date: (formData.get('next_followup_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/outreach')
}

export async function deleteOutreachCompany(id: string) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()
  const { error } = await supabase.from('outreach_companies').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/outreach')
}

export async function convertOutreachToLead(id: string) {
  const sp = await getSessionProfile()
  requireRole(sp.system_role, ['admin', 'coordinator'])

  const supabase = await createServerClient()

  const { data: company } = await supabase
    .from('outreach_companies')
    .select('*')
    .eq('id', id)
    .single()

  if (!company) throw new Error('Company not found')

  const { data: intake, error: intakeError } = await supabase
    .from('intakes')
    .insert({
      title: `Lead from ${company.company_name}`,
      source: company.contact_channel ?? 'other',
      temp_client_name: company.company_name,
      discipline: 'other',
      project_type: 'other',
      status: 'new',
      contact_channel: company.contact_channel,
      contact_value: company.contact_value,
      received_date: new Date().toISOString().split('T')[0],
      created_by: sp.id,
    })
    .select()
    .single()

  if (intakeError) throw new Error(intakeError.message)

  await supabase
    .from('outreach_companies')
    .update({ status: 'converted', converted_intake_id: intake.id })
    .eq('id', id)

  revalidatePath('/outreach')
  revalidatePath('/leads')
  return intake
}
