import { createServerClient } from '@/lib/supabase/server'

export type MemberOption = { id: string; full_name: string }
export type ProjectOption = { id: string; name: string }

export async function getMemberOptions(): Promise<MemberOption[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('active_status', 'active')
    .order('full_name')

  return (data ?? []) as MemberOption[]
}

export async function getProjectOptions(): Promise<ProjectOption[]> {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('projects')
    .select('id, name')
    .order('name')

  return (data ?? []) as ProjectOption[]
}
