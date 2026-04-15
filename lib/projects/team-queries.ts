// Server-side query helpers for project team assignments
import { createServerClient } from '@/lib/supabase/server'

export interface TeamMemberWithProfile {
  id: string
  project_id: string
  user_id: string
  team_role: string
  assigned_at: string
  profiles: {
    id: string
    full_name: string
    email: string
    discipline: string | null
  }
}

/**
 * Get all team members for a project, joined with profile data.
 */
export async function getTeamByProjectId(
  projectId: string,
): Promise<TeamMemberWithProfile[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('project_team_assignments')
    .select('*, profiles(id, full_name, email, discipline)')
    .eq('project_id', projectId)
    .order('assigned_at', { ascending: true })

  if (error) return []
  return (data ?? []) as unknown as TeamMemberWithProfile[]
}
