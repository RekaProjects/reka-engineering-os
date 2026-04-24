import type { SupabaseClient } from '@supabase/supabase-js'
import { buildRekaDriveFolderName } from '@/lib/files/drive-service'
import { createDriveFolderForProject } from '@/lib/google/workspace-drive'

/**
 * Best-effort: create a Google Drive folder for a new project when OAuth is configured.
 */
export async function tryCreateProjectDriveFolderAfterInsert(
  supabase: SupabaseClient,
  params: { projectId: string; projectCode: string; clientId: string },
): Promise<void> {
  const { data: client } = await supabase.from('clients').select('client_code').eq('id', params.clientId).maybeSingle()
  const clientCode = (client?.client_code as string | undefined)?.trim() || 'CLIENT'
  const folderName = buildRekaDriveFolderName({
    clientCode,
    projectCode: params.projectCode || 'PROJ',
  })

  const created = await createDriveFolderForProject(supabase, folderName)
  if (!created) return

  const link =
    created.webViewLink ?? `https://drive.google.com/drive/folders/${created.id}`

  await supabase
    .from('projects')
    .update({
      google_drive_folder_id:   created.id,
      google_drive_folder_link: link,
    })
    .eq('id', params.projectId)
}
