import { createServerClient } from '@/lib/supabase/server'
import type { CompensationStatus, RateType } from '@/types/database'

export type CompensationRow = {
  id: string
  member_id: string
  project_id: string
  task_id: string | null
  deliverable_id: string | null
  rate_type: RateType
  qty: number
  rate_amount: number
  subtotal_amount: number
  currency_code: string
  status: CompensationStatus
  period_label: string | null
  work_date: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  member: { full_name: string } | null
  project: { name: string } | null
}

const COMP_SELECT = `
  *,
  member:profiles!member_id(full_name),
  project:projects!project_id(name)
`.trim()

export async function getCompensationRecords(): Promise<CompensationRow[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('compensation_records')
    .select(COMP_SELECT)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as CompensationRow[]
}

export async function getCompensationById(id: string): Promise<CompensationRow | null> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('compensation_records')
    .select(COMP_SELECT)
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as CompensationRow
}

export async function getCompensationByMember(memberId: string): Promise<CompensationRow[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('compensation_records')
    .select(COMP_SELECT)
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as CompensationRow[]
}
