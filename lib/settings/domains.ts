/**
 * lib/settings/domains.ts
 * Typed domain constants and fallback map for the setting_options table.
 * The fallback arrays are sourced from lib/constants/options.ts so
 * that if the DB table is empty for a domain, the app still works.
 */

import {
  FUNCTIONAL_ROLES,
  DISCIPLINES,
  WORKER_TYPES,
  PROJECT_TYPES,
  TASK_CATEGORY_OPTIONS,
  DELIVERABLE_TYPE_OPTIONS,
  FILE_CATEGORY_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
} from '@/lib/constants/options'

// ── Domain keys ──────────────────────────────────────────────

export const SETTING_DOMAINS = [
  'functional_role',
  'discipline',
  'worker_type',
  'project_type',
  'task_category',
  'deliverable_type',
  'file_category',
  'payment_method',
] as const

export type SettingDomain = (typeof SETTING_DOMAINS)[number]

// ── Human-readable labels ────────────────────────────────────

export const DOMAIN_LABELS: Record<SettingDomain, string> = {
  functional_role:  'Functional Roles',
  discipline:       'Disciplines',
  worker_type:      'Worker Types',
  project_type:     'Project Types',
  task_category:    'Task Categories',
  deliverable_type: 'Deliverable Types',
  file_category:    'File Categories',
  payment_method:   'Payment Methods',
}

// ── Fallback map ─────────────────────────────────────────────
// Each fallback is the same shape as {value, label}[] so queries
// can return these if the DB has no rows for a domain.

type OptionPair = { value: string; label: string }

function toPlain(arr: readonly { readonly value: string; readonly label: string }[]): OptionPair[] {
  return arr.map(({ value, label }) => ({ value, label }))
}

export const DOMAIN_FALLBACKS: Record<SettingDomain, OptionPair[]> = {
  functional_role:  toPlain(FUNCTIONAL_ROLES),
  discipline:       toPlain(DISCIPLINES),
  worker_type:      toPlain(WORKER_TYPES),
  project_type:     toPlain(PROJECT_TYPES),
  task_category:    toPlain(TASK_CATEGORY_OPTIONS),
  deliverable_type: toPlain(DELIVERABLE_TYPE_OPTIONS),
  file_category:    toPlain(FILE_CATEGORY_OPTIONS),
  payment_method:   toPlain(PAYMENT_METHOD_OPTIONS),
}
