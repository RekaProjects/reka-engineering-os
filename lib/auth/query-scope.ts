/**
 * Stage RBAC-03 — scoped project lists for create/edit forms (dropdown data minimization).
 */

import { effectiveRole } from '@/lib/auth/permissions'
import type { SessionProfile } from '@/lib/auth/session'
import { userCanEditProjectMetadata, userCanViewProject } from '@/lib/auth/access-surface'
import { getProjectById, getProjects, type ProjectWithRelations } from '@/lib/projects/queries'
import {
  getUsersForCoordinatorProjectPortfolio,
  getUsersForProjectAssignment,
  getUsersForSelect,
  type UserSelectRow,
} from '@/lib/users/queries'

/**
 * Projects shown in task/deliverable/file forms.
 * - Admin: all projects
 * - Coordinator: assigned projects, or a single locked project if they may operate on it
 * - Other roles (edit pages): only the locked project when the user may view it
 */
export async function projectOptionsForMutationForms(
  profile: SessionProfile,
  lockedProjectId?: string | null,
): Promise<ProjectWithRelations[]> {
  const r = effectiveRole(profile.system_role)
  if (r === 'admin') return getProjects()

  if (r === 'coordinator') {
    if (lockedProjectId) {
      const p = await getProjectById(lockedProjectId)
      if (!p) return []
      if (!(await userCanEditProjectMetadata(profile, p))) return []
      return [p]
    }
    return getProjects({ assignedUserId: profile.id })
  }

  if (lockedProjectId) {
    const p = await getProjectById(lockedProjectId)
    if (!p) return []
    if (!(await userCanViewProject(profile, p))) return []
    return [p]
  }

  return []
}

/**
 * Profiles for task/deliverable assignment dropdowns (lead, reviewer, team on a project).
 * - Admin: all active profiles
 * - Coordinator (edit, known project): roster for that project only
 * - Coordinator (create or no project yet): union across assigned portfolio
 * - Other roles: full list (only admin/coordinator reach assignment pickers in practice)
 */
export async function usersForAssignmentPickers(
  profile: SessionProfile,
  opts: { mode: 'create' | 'edit'; lockedProjectId: string | null },
): Promise<UserSelectRow[]> {
  const r = effectiveRole(profile.system_role)
  if (r === 'admin') return getUsersForSelect()
  if (r === 'coordinator') {
    if (opts.mode === 'edit' && opts.lockedProjectId) {
      return getUsersForProjectAssignment(opts.lockedProjectId)
    }
    return getUsersForCoordinatorProjectPortfolio(profile.id)
  }
  return getUsersForSelect()
}
