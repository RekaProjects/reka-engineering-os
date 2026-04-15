// Server-side query helpers for the Tasks module
import { createServerClient } from '@/lib/supabase/server'
import type { Task } from '@/types/database'

// ─── Types ────────────────────────────────────────────────────

export type TaskWithRelations = Task & {
  projects: { id: string; name: string; project_code: string } | null
  assignee: { id: string; full_name: string } | null
  reviewer: { id: string; full_name: string } | null
}

// ─── List (all tasks, cross-project) ──────────────────────────

export async function getTasks(opts?: {
  search?: string
  status?: string
  priority?: string
  project_id?: string
  assigned_to?: string
}): Promise<TaskWithRelations[]> {
  const supabase = await createServerClient()

  let query = supabase
    .from('tasks')
    .select(
      '*, projects(id, name, project_code), assignee:profiles!assigned_to_user_id(id, full_name), reviewer:profiles!reviewer_user_id(id, full_name)'
    )
    .order('created_at', { ascending: false })

  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  }
  if (opts?.priority && opts.priority !== 'all') {
    query = query.eq('priority', opts.priority)
  }
  if (opts?.project_id) {
    query = query.eq('project_id', opts.project_id)
  }
  if (opts?.assigned_to) {
    query = query.eq('assigned_to_user_id', opts.assigned_to)
  }
  if (opts?.search) {
    query = query.or(
      `title.ilike.%${opts.search}%`
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as TaskWithRelations[]
}

// ─── Single ───────────────────────────────────────────────────

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(
      '*, projects(id, name, project_code), assignee:profiles!assigned_to_user_id(id, full_name), reviewer:profiles!reviewer_user_id(id, full_name)'
    )
    .eq('id', id)
    .single()

  if (error) return null
  return data as unknown as TaskWithRelations
}

// ─── By Project ───────────────────────────────────────────────

export async function getTasksByProjectId(projectId: string): Promise<TaskWithRelations[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('tasks')
    .select(
      '*, projects(id, name, project_code), assignee:profiles!assigned_to_user_id(id, full_name), reviewer:profiles!reviewer_user_id(id, full_name)'
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (error) return []
  return (data ?? []) as unknown as TaskWithRelations[]
}
