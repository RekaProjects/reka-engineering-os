# Stage 3 — Google Drive Auto-Folder: Complete OAuth & Fix Production Setup

## Context

This is a **Next.js 15 App Router + TypeScript strict + Supabase** project deployed on **Vercel**.

The app auto-creates a Google Drive folder whenever a new project is inserted into Supabase. The flow:
1. A Supabase trigger fires after INSERT on `projects`
2. It calls a Next.js webhook/action which uses the `googleapis` library
3. The library needs a stored OAuth2 refresh token from table `public.google_workspace_tokens`

The OAuth2 routes are already implemented:
- **Start**: `app/api/integrations/google/oauth/start/route.ts` — redirects user to Google consent screen
- **Callback**: `app/api/integrations/google/oauth/callback/route.ts` — exchanges code for tokens, upserts into `google_workspace_tokens` with `id = 'default'`

The Google Drive connect button is already in the Settings page (Finance tab), visible to management roles (Direktur, TD, Finance).

---

## Problem

The Google Drive folder is NOT auto-created because:

1. **The OAuth flow has never been completed** — there is no row in `google_workspace_tokens` with `id = 'default'`
2. **`NEXT_PUBLIC_APP_URL` is not set to the production URL in Vercel** — the callback route constructs the redirect URI using this env var: `` `${appUrl.replace(/\/$/, '')}/api/integrations/google/oauth/callback` ``
3. **Google Cloud Console may be missing the production redirect URI** — it needs to include the Vercel deployment URL

This causes the `tryCreateProjectDriveFolderAfterInsert` function to silently fail — it catches the error and returns without creating the folder.

---

## Step 1 — Set `NEXT_PUBLIC_APP_URL` in Vercel

### Manual step (not code):

1. Go to https://vercel.com/dashboard
2. Select your Reka Engineering OS project
3. Go to **Settings → Environment Variables**
4. Find `NEXT_PUBLIC_APP_URL` (or add it if missing)
5. Set its value to your production URL, e.g.: `https://reka-engineering-os.vercel.app`
   - Use your actual production domain, NOT localhost
   - No trailing slash
6. Click Save
7. **Redeploy** the project (Vercel → Deployments → trigger a redeploy, or push a new commit)

---

## Step 2 — Add Production URL to Google Cloud Console

### Manual step (not code):

1. Go to https://console.cloud.google.com
2. Select the project used for this app
3. Go to **APIs & Services → Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, verify BOTH of these exist:
   - `http://localhost:3000/api/integrations/google/oauth/callback` (for local dev)
   - `https://[your-production-domain]/api/integrations/google/oauth/callback` (for production)
6. If the production URI is missing, click **Add URI**, paste it, then click **Save**

---

## Step 3 — Check the `google_workspace_tokens` Table Structure

Run this in Supabase SQL Editor to verify the table exists:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'google_workspace_tokens'
ORDER BY ordinal_position;
```

Expected columns: `id`, `refresh_token`, `access_token`, `expires_at`, `provider_email`, `updated_by`, `updated_at`

If the table does NOT exist, run the migration manually from `supabase/migrations/0033_google_workspace_tokens.sql`.

Also verify there is currently no token stored:
```sql
SELECT id, provider_email, updated_at FROM public.google_workspace_tokens;
```

If empty → OAuth flow has not been completed. Continue to Step 4.

---

## Step 4 — Complete the OAuth Flow (Connect Google Drive)

### Manual step (not code):

1. Make sure Steps 1 & 2 are done and Vercel has redeployed
2. Log in to the app as **Direktur** or **Technical Director** (management role required)
3. Go to **Settings → Finance tab**
4. Click **"Hubungkan Google Drive (akun organisasi)"**
5. You will be redirected to Google's consent screen
6. Choose the **organization Google account** (not personal)
7. Grant the `drive.file` permission
8. You'll be redirected back to `/settings?tab=finance&drive=connected`
9. A green success banner should appear: "Google Drive terhubung."

After this, run the SQL check again:
```sql
SELECT id, provider_email, updated_at FROM public.google_workspace_tokens;
```
Should now show one row with `id = 'default'` and the connected Google account email.

---

## Step 5 — Verify the Google Drive Folder Creation Function

File: look for the function that creates folders. It should be in one of:
- `lib/integrations/google/drive.ts`
- `lib/google/drive.ts`
- `app/api/projects/*/route.ts`

Find where `tryCreateProjectDriveFolderAfterInsert` is defined. It should:
1. Fetch the token from `google_workspace_tokens` where `id = 'default'`
2. Create an OAuth2 client with the stored refresh token
3. Call the Google Drive API to create a folder named after the project
4. Update the project record with the created folder ID (`drive_folder_id` or similar column)

Check for these common issues:

**Issue A: Silent error swallowing**
The function might have `try { ... } catch { return null }` which hides errors. Change it to at least log the error:
```ts
} catch (err) {
  console.error('[Google Drive] Failed to create folder:', err)
  return null
}
```

**Issue B: Wrong token lookup**
The function might be looking for the token incorrectly. Verify:
```ts
const { data: tokenRow } = await supabase
  .from('google_workspace_tokens')
  .select('refresh_token, access_token')
  .eq('id', 'default')
  .single()
```
If `tokenRow` is null, the function exits early. Add a console.error for this case.

**Issue C: Token refresh not working**
The stored access token may be expired. The OAuth2 client should auto-refresh using the refresh token. Make sure `oauth2Client.setCredentials({ refresh_token: tokenRow.refresh_token })` is called before making API calls.

---

## Step 6 — Improve Settings Finance Tab (show connection status)

The current settings page shows the Google Drive connect link, but doesn't show whether it's already connected. Improve the Settings finance tab to show the current connection status.

File: `app/(protected)/settings/page.tsx`

### Add a Supabase query for token status

At the top of the `SettingsPage` function, fetch the token status for the `finance` tab:

```ts
// Add this import at top:
import { createServerClient } from '@/lib/supabase/server'

// Inside SettingsPage, before the return, when tab === 'finance':
let driveConnected = false
let driveEmail: string | null = null

if (tab === 'finance') {
  const supabase = await createServerClient()
  const { data: tokenRow } = await supabase
    .from('google_workspace_tokens')
    .select('provider_email, updated_at')
    .eq('id', 'default')
    .maybeSingle()
  
  driveConnected = tokenRow != null
  driveEmail = tokenRow?.provider_email ?? null
}
```

### Update the finance tab UI to show connection status

In the `{tab === 'finance' && (...)}` block, replace the current link section:

```tsx
{isManagement(sp.system_role) && (
  <div className="mb-4 rounded-lg border border-[var(--color-border)] p-4">
    <div className="mb-2 flex items-center gap-2">
      <span className="text-[0.8125rem] font-semibold text-[var(--color-text-primary)]">
        Google Drive Integration
      </span>
      {driveConnected ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-success-subtle)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--color-success)]">
          ● Terhubung
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-warning-subtle)] px-2 py-0.5 text-[0.6875rem] font-semibold text-[var(--color-warning)]">
          ○ Belum terhubung
        </span>
      )}
    </div>
    {driveConnected && driveEmail && (
      <p className="mb-2 text-[0.8125rem] text-[var(--color-text-muted)]">
        Akun: <span className="font-medium text-[var(--color-text-secondary)]">{driveEmail}</span>
      </p>
    )}
    <p className="mb-3 text-[0.8125rem] text-[var(--color-text-muted)]">
      {driveConnected
        ? 'Folder Google Drive akan otomatis dibuat untuk setiap proyek baru.'
        : 'Hubungkan akun Google organisasi agar folder proyek dibuat otomatis di Drive.'}
    </p>
    <a
      href="/api/integrations/google/oauth/start"
      className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 text-[0.8125rem] font-medium text-[var(--color-primary-fg)] no-underline hover:opacity-90 transition-opacity"
    >
      {driveConnected ? 'Hubungkan ulang / ganti akun' : 'Hubungkan Google Drive'}
    </a>
  </div>
)}
```

---

## What NOT to Change

- Do NOT change the OAuth routes (`start/route.ts` and `callback/route.ts`) — they are correct
- Do NOT change the `google_workspace_tokens` migration — it's correct
- Do NOT change the `drive.file` OAuth scope — it's the minimum needed
- Do NOT change how the token is stored (upsert with `id = 'default'`)

---

## Verification

1. Run `npx tsc --noEmit` — zero errors
2. Visit Settings → Finance tab
3. Connection status should show (connected/not connected)
4. If not connected: click "Hubungkan Google Drive", complete Google consent
5. After connecting: status shows "Terhubung" with the Google account email
6. Create a new project as TD or Manajer
7. Check that a Google Drive folder was created (verify in the Google account's Drive)
8. Check that the project record in Supabase has a non-null `drive_folder_id` (or equivalent column)
