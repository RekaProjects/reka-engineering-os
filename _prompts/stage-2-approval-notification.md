# Stage 2 — Apply Approval Notification Migration & Verify End-to-End Flow

## Context

This is a **Next.js 15 App Router + TypeScript strict + Supabase** project.
Supabase is used for the database, auth, and Realtime.

The notification system works like this:
- SQL SECURITY DEFINER triggers insert rows into `public.notifications`
- The `notifications` table is in the Supabase Realtime publication (`supabase_realtime`)
- A React hook (`hooks/useRealtimeNotifications.ts`) subscribes via `postgres_changes`
- The bell icon (`components/layout/NotificationsBell.tsx`) shows the unread count

The app uses a **manual migration** approach — `.sql` files in `supabase/migrations/` but they are NOT auto-applied. They must be run manually in the Supabase SQL Editor.

---

## Problem

There is an existing SQL migration file that fixes approval notifications:
**`supabase/migrations/0034_approval_notification_trigger.sql`**

This file:
1. Creates trigger `tr_direktur_pending_approval_notifications` — notifies ALL Direktur users when any project enters `pending_approval` status
2. Replaces the `notify_project_status_changed()` function (originally from migration 0032) with an improved version that notifies the project lead when Direktur approves (→ `new`) or rejects (→ `rejected`)

**The problem:** This migration file exists on disk but has likely NOT been applied to the live Supabase database yet. Until it is applied:
- Direktur gets no notification when a project needs approval
- Project lead gets no notification when their project is approved/rejected
- The bell icon stays empty for Direktur even when projects are waiting

---

## Step 1 — Apply the Migration in Supabase

### Instructions for the user (not code — these are manual steps):

1. Open the Supabase Dashboard: https://supabase.com/dashboard
2. Select the project: `sjisdvcgqcqxbnszruco`
3. Go to **SQL Editor** (left sidebar)
4. Click **New query**
5. Paste the ENTIRE contents of `supabase/migrations/0034_approval_notification_trigger.sql`
6. Click **Run**
7. Confirm no errors appear in the output panel

**Do not skip this step.** The rest of Stage 2 depends on this migration being live.

---

## Step 2 — Verify the Triggers Exist

After running the migration, run this verification query in Supabase SQL Editor:

```sql
SELECT trigger_name, event_object_table, action_timing
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'projects'
ORDER BY trigger_name;
```

You should see both:
- `tr_direktur_pending_approval_notifications` ← new one from migration 0034
- `tr_project_status_notifications` ← original from migration 0032 (still valid, calls the updated function)

Also verify the updated function exists:
```sql
SELECT proname, prosrc
FROM pg_proc
WHERE proname = 'notify_direktur_pending_approval';
```

---

## Step 3 — Check Notifications Table Has Correct Schema

Run in Supabase SQL Editor:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'notifications'
ORDER BY ordinal_position;
```

Expected columns: `id`, `user_id`, `type`, `title`, `body`, `link`, `read_at`, `created_at`

If the `link` column is missing (it was added in migration 0034), run:
```sql
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS link text;
```

---

## Step 4 — Verify Dashboard Widget is Wired Up

The Direktur dashboard already has the "Menunggu Persetujuan" section. Verify these files are correct:

### `lib/dashboard/direktur-queries.ts`
This file should already have `getPendingApprovalProjects()` function that queries:
```ts
.from('projects')
.eq('status', 'pending_approval')
.order('approval_requested_at', { ascending: true })
```
And `DirekturDashboardData` type should include `pendingApprovalProjects: PendingApprovalProjectRow[]`.

### `components/modules/dashboard/DashboardDirektur.tsx`
Should have a section with conditional render:
```tsx
{data.pendingApprovalProjects.length > 0 && (
  <div ...> {/* "Menunggu Persetujuan" section */}
    ...
  </div>
)}
```

If either of these is missing, implement them. But they should already be there — just confirm.

---

## Step 5 — Verify ProjectApprovalBanner Works

File: `components/modules/projects/ProjectApprovalBanner.tsx`

This banner should:
- Only render when project status is `pending_approval`
- Only show Approve/Reject buttons when the current user role is `direktur`
- On approve: call a server action that sets `status = 'new'` and sets `approval_reviewed_by`, `approval_reviewed_at`
- On reject: call a server action that sets `status = 'rejected'` and saves the `rejection_note`

Read this file and check that both server actions exist and correctly update the `projects` table. The SQL trigger in Supabase (`tr_project_status_notifications`) will fire automatically on status update and send the notification to the project lead.

If the approve/reject server actions are calling an API route or directly using the Supabase client, verify the update includes at minimum:
```ts
{ status: 'new', approval_reviewed_by: userId, approval_reviewed_at: new Date().toISOString() }
// or
{ status: 'rejected', rejection_note: note, approval_reviewed_by: userId, approval_reviewed_at: new Date().toISOString() }
```

---

## Step 6 — Verify ProjectForm Sets `pending_approval` on Create

File: `components/modules/projects/ProjectForm.tsx`

When a TD or Manajer submits a new project, the initial status should be set to `pending_approval`. Look for the submit/create server action and confirm:
```ts
status: 'pending_approval',
approval_requested_at: new Date().toISOString(),
```

If it's creating with `status: 'new'` instead, change it to `status: 'pending_approval'`.

---

## Step 7 — Verify Realtime is Enabled on Notifications Table

The user has confirmed in Supabase Dashboard that the `notifications` table IS enabled in the `supabase_realtime` publication (it shows green). No code change needed here.

However, confirm the hook subscription filter in `hooks/useRealtimeNotifications.ts` uses the correct channel and filter:
```ts
.channel('notifications:' + userId)
.on('postgres_changes', {
  event: 'INSERT',
  schema: 'public',
  table: 'notifications',
  filter: `user_id=eq.${userId}`,
}, ...)
.subscribe()
```

If `userId` is undefined/null, the subscription won't work. The userId comes from `notificationUserId={profile.id}` passed from `app/(protected)/layout.tsx` through `AppTopbar` to `NotificationsBell`.

---

## What NOT to Change

- Do NOT change anything in migration 0032 — it's correct, 0034 replaces only the function, not the trigger
- Do NOT change the `notifications` table RLS policies (own-row select/update is correct)
- Do NOT touch the bell component UI — it's fine
- Do NOT modify how `useRealtimeNotifications` fetches initial notifications on mount

---

## Verification (end-to-end test)

1. Log in as **Technical Director** or **Manajer**
2. Create a new project — status should immediately show "Pending Approval"
3. Log in as **Direktur** in another browser/incognito
4. The bell icon should show an unread badge
5. The dashboard "Menunggu Persetujuan" section should list the new project
6. Click the project → the ApprovalBanner should appear with Approve/Reject buttons
7. Click Approve → status changes to "New"
8. Log back in as TD/Manajer → bell should show "Proyek disetujui" notification
