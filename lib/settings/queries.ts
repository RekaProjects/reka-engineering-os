/**
 * lib/settings/queries.ts
 * Server-side queries for the setting_options table.
 * Falls back to hardcoded arrays when the DB has no rows for a domain.
 */

import { createServerClient } from '@/lib/supabase/server'
import { type SettingDomain, DOMAIN_FALLBACKS, SETTING_DOMAINS } from './domains'

export interface SettingOption {
  id: string
  domain: string
  value: string
  label: string
  sort_order: number
  is_active: boolean
  created_at: string
}

/**
 * Returns active options for a given domain.
 * If no rows exist in DB, returns the hardcoded fallback.
 */
export async function getSettingOptions(
  domain: SettingDomain,
): Promise<{ value: string; label: string }[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('setting_options')
    .select('value, label')
    .eq('domain', domain)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !data || data.length === 0) {
    return DOMAIN_FALLBACKS[domain] ?? []
  }

  return data
}

/**
 * Returns ALL options (including inactive) for admin management.
 */
export async function getSettingOptionsFull(
  domain: SettingDomain,
): Promise<SettingOption[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('setting_options')
    .select('*')
    .eq('domain', domain)
    .order('sort_order', { ascending: true })

  if (error || !data) return []
  return data as unknown as SettingOption[]
}

/**
 * Returns all distinct domains currently stored in the DB.
 */
export async function getStoredDomains(): Promise<string[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('setting_options')
    .select('domain')

  if (error || !data) return []

  const unique = [...new Set(data.map((r: { domain: string }) => r.domain))]
  return unique.sort()
}

/**
 * Returns the canonical list of domains (from code), enriched with
 * a count of DB rows per domain.
 */
export async function getDomainSummary(): Promise<
  { domain: SettingDomain; label: string; count: number }[]
> {
  const { DOMAIN_LABELS } = await import('./domains')
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('setting_options')
    .select('domain')

  const countMap: Record<string, number> = {}
  if (!error && data) {
    for (const row of data) {
      countMap[row.domain] = (countMap[row.domain] ?? 0) + 1
    }
  }

  return SETTING_DOMAINS.map((d) => ({
    domain: d,
    label: DOMAIN_LABELS[d],
    count: countMap[d] ?? 0,
  }))
}
