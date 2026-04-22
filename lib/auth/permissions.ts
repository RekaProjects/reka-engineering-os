/**
 * lib/auth/permissions.ts
 * Pure role-predicate and nav-permission helpers.
 * Safe to import from both server components AND client components.
 */

import type { SystemRole } from '@/types/database'

// ── Role predicates ──────────────────────────────────────────

export function effectiveRole(role: SystemRole | null | undefined): SystemRole {
  return role ?? 'member'
}

export function isAdmin(role: SystemRole | null | undefined): boolean {
  return effectiveRole(role) === 'admin'
}

export function isCoordinator(role: SystemRole | null | undefined): boolean {
  return effectiveRole(role) === 'coordinator'
}

export function isReviewer(role: SystemRole | null | undefined): boolean {
  return effectiveRole(role) === 'reviewer'
}

export function isMember(role: SystemRole | null | undefined): boolean {
  return effectiveRole(role) === 'member'
}

export function isAdminOrCoordinator(role: SystemRole | null | undefined): boolean {
  const r = effectiveRole(role)
  return r === 'admin' || r === 'coordinator'
}

// ── Route / CTA surface ──────────────────────────────────────

export function canAccessProjectsNewRoute(role: SystemRole | null | undefined): boolean {
  return effectiveRole(role) === 'admin'
}

export function canAccessTasksDeliverablesFilesNewRoute(role: SystemRole | null | undefined): boolean {
  return isAdminOrCoordinator(role)
}

export function canShowFilesAddButton(role: SystemRole | null | undefined): boolean {
  return isAdminOrCoordinator(role)
}

// ── Nav visibility + labelling helpers ───────────────────────

export type NavPermissions = {
  showClients:        boolean
  showLeads:          boolean
  showOutreach:       boolean
  showTeam:           boolean
  showCompensation:   boolean
  showPayments:       boolean
  showSettings:       boolean
  showMyPayments:     boolean
  showFinance:        boolean
  labelProjects:      string
  labelTasks:         string
  labelDashboard:     string
}

export function getNavPermissions(role: SystemRole | null | undefined): NavPermissions {
  const r = effectiveRole(role)
  const personal = r === 'member'

  return {
    showClients:      r === 'admin' || r === 'coordinator',
    showLeads:        r === 'admin' || r === 'coordinator',
    showOutreach:     r === 'admin' || r === 'coordinator',
    showTeam:         r === 'admin',
    showCompensation: r === 'admin',
    showPayments:     r === 'admin',
    showSettings:     r === 'admin',
    showMyPayments:   r === 'member' || r === 'reviewer',
    showFinance:      r === 'admin' || r === 'coordinator',

    labelDashboard: personal ? 'My Dashboard' : 'Dashboard',
    labelProjects:  personal ? 'My Projects'  : 'Projects',
    labelTasks:     personal ? 'My Tasks'     : 'Tasks',
  }
}
