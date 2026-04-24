import type { SupabaseClient } from '@supabase/supabase-js'
import { google } from 'googleapis'

function oauthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!clientId || !clientSecret || !appUrl) return null
  return new google.auth.OAuth2(clientId, clientSecret, `${appUrl.replace(/\/$/, '')}/api/integrations/google/oauth/callback`)
}

/**
 * Creates a Drive folder when workspace tokens exist. Returns null if Drive is not connected.
 */
export async function createDriveFolderForProject(
  supabase: SupabaseClient,
  folderName: string,
): Promise<{ id: string; webViewLink?: string | null } | null> {
  const oauth2 = oauthClient()
  if (!oauth2) return null

  const { data: row } = await supabase.from('google_workspace_tokens').select('*').eq('id', 'default').maybeSingle()
  if (!row?.refresh_token) return null

  oauth2.setCredentials({
    refresh_token: row.refresh_token as string,
    access_token: (row.access_token as string) || undefined,
    expiry_date: row.expires_at ? new Date(row.expires_at as string).getTime() : undefined,
  })

  const drive = google.drive({ version: 'v3', auth: oauth2 })
  const res = await drive.files.create({
    requestBody: {
      name:       folderName,
      mimeType:   'application/vnd.google-apps.folder',
    },
    fields: 'id, webViewLink',
  })

  const id = res.data.id
  if (!id) return null
  return { id, webViewLink: res.data.webViewLink }
}
