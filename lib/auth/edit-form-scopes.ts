/**
 * Stage RBAC-04 — edit-form scope labels for UI alignment with server mutation rules.
 * Safe to import from Server Components (uses getProjectById only in async deliverable helper).
 */

import type { SessionProfile } from '@/lib/auth/session'
import { effectiveRole } from '@/lib/auth/permissions'
import type { Task } from '@/types/database'
import type { Deliverable } from '@/types/database'
import type { ProjectFile } from '@/types/database'
import { getProjectById } from '@/lib/projects/queries'

export type TaskEditFormScope = 'full' | 'reviewer' | 'assignee'

export function getTaskEditFormScope(profile: SessionProfile, task: Task): TaskEditFormScope {
  const r = effectiveRole(profile.system_role)
  if (r === 'admin' || r === 'coordinator') return 'full'
  if (r === 'reviewer' && task.reviewer_user_id === profile.id) return 'reviewer'
  return 'assignee'
}

export type DeliverableEditFormScope = 'full' | 'reviewer' | 'preparer'

export async function getDeliverableEditFormScope(
  profile: SessionProfile,
  d: Deliverable,
): Promise<DeliverableEditFormScope> {
  const r = effectiveRole(profile.system_role)
  if (r === 'admin' || r === 'coordinator') return 'full'
  if (r === 'reviewer') {
    if (d.reviewed_by_user_id === profile.id) return 'reviewer'
    const project = await getProjectById(d.project_id)
    if (project?.reviewer_user_id === profile.id) return 'reviewer'
    return 'full'
  }
  if (r === 'member' && d.prepared_by_user_id === profile.id) return 'preparer'
  return 'full'
}

export type FileEditFormScope = 'full' | 'uploader'

export function getFileEditFormScope(profile: SessionProfile, file: ProjectFile): FileEditFormScope {
  const r = effectiveRole(profile.system_role)
  if (r === 'admin' || r === 'coordinator') return 'full'
  return 'uploader'
}
