// Server-side query helpers for user profiles
// Used by project forms for lead/reviewer assignment dropdowns
import { createServerClient } from '@/lib/supabase/server'

export async function getUsersForSelect(): Promise<{ id: string; full_name: string; email: string; discipline: string | null }[]> {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, discipline')
    .eq('is_active', true)
    .order('full_name', { ascending: true })

  if (error) return []
  return data ?? []
}
