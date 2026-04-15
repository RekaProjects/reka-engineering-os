// Server-side query helpers for the Projects module
import { createServerClient } from '@/lib/supabase/server'
import type { Project } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────

export type ProjectWithRelations = Project & {
  clients: { id: string; client_name: string; client_code: string } | null
  lead: { id: string; full_name: string } | null
  reviewer: { id: string; full_name: string } | null
  intakes: { id: string; intake_code: string; title: string } | null
}

// ─── List ─────────────────────────────────────────────────────

export async function getProjects(opts?: {
  search?: string
  status?: string
  discipline?: string
  priority?: string
}): Promise<ProjectWithRelations[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from('projects')
    .select(
      '*, clients(id, client_name, client_code), lead:profiles!project_lead_user_id(id, full_name), reviewer:profiles!reviewer_user_id(id, full_name), intakes:intakes!intake_id(id, intake_code, title)'
    )
    .order('created_at', { ascending: false })

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  }
  if (opts?.discipline && opts.discipline !== 'all') {
    query = query.eq('discipline', opts.discipline)
  }
  if (opts?.priority && opts.priority !== 'all') {
    query = query.eq('priority', opts.priority)
  }
  if (opts?.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,project_code.ilike.%${opts.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ProjectWithRelations[]
}

// ─── Single ───────────────────────────────────────────────────

export async function getProjectById(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select(
      '*, clients(id, client_name, client_code), lead:profiles!project_lead_user_id(id, full_name), reviewer:profiles!reviewer_user_id(id, full_name), intakes:intakes!intake_id(id, intake_code, title)'
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as ProjectWithRelations
}

// ─── By Client ────────────────────────────────────────────────

export async function getProjectsByClientId(clientId: string): Promise<Project[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as Project[]
}
