# Stage 4 — Manajer Team Availability Visibility

## Context

This is a **Next.js 15 App Router + TypeScript strict + Supabase** project.
There are 8 system roles: `direktur`, `technical_director`, `finance`, `manajer`, `bd`, `senior`, `member`, `freelancer`.

The **Team** module (`/team`) currently allows access only to: `direktur`, `technical_director`, `finance`.

```ts
// lib/auth/permissions.ts
export const canAccessTeam = (r?: SystemRole | null) =>
  ['direktur', 'technical_director', 'finance'].includes(effectiveRole(r))
```

---

## Problem

The system design spec says:

| Role | Team Access |
|---|---|
| Direktur | R — Read (includes rates) |
| Technical Director | ✓ Full |
| Finance | ~ Banking + Rate only |
| **Manajer** | **~ Availability only** ← **MISSING** |
| BD/Senior/Member/Freelancer | ✗ No access |

Manajer currently has **zero** visibility into the team, but per the spec they need to:
- See which team members are **available**, **partially available**, or **unavailable/on leave**
- Use this to plan who they can assign to their projects
- They must NOT see: salary rates, banking details, compensation data

---

## What Needs to Change

### 1. Add `canViewTeamAvailability` predicate to `lib/auth/permissions.ts`

Add this new predicate (after the existing `canAccessTeam` line):

```ts
/** Manajer — can see team member availability only (no rates, no banking) */
export const canViewTeamAvailability = (r?: SystemRole | null) =>
  effectiveRole(r) === 'manajer'
```

Also update `getNavPermissions()` in the same file to show the Team link for Manajer:

```ts
// BEFORE:
showTeam: canAccessTeam(role),

// AFTER:
showTeam: canAccessTeam(role) || canViewTeamAvailability(role),
```

### 2. Find the Team page

The Team page is likely at one of:
- `app/(protected)/team/page.tsx`
- `app/(protected)/team/members/page.tsx`

Read this file to understand how it's structured.

### 3. Update the Team page to handle Manajer's limited view

At the top of the Team page server component, fetch the current user's role and pass it down. Then conditionally render a limited view for Manajer.

**For Manajer — show only:**
- Full name
- Avatar / photo
- Functional role / job title
- Availability status badge (available / partially_available / unavailable / on_leave)
- Skills/discipline tags (if they exist)

**For Manajer — hide:**
- Hourly/daily rate
- Monthly salary
- Banking details (bank name, account number, e-wallet)
- Any finance-related columns

### 4. Update the Team query to support Manajer's limited data fetch

Find the query function used by the Team page (likely in `lib/team/queries.ts` or `lib/profiles/queries.ts`).

Create a separate lightweight query for Manajer:

```ts
export async function getTeamAvailabilityForManajer(): Promise<TeamAvailabilityRow[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      photo_url,
      availability_status,
      skill_tags,
      functional_role
    `)
    .eq('active_status', 'active')
    .order('full_name', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export type TeamAvailabilityRow = {
  id: string
  full_name: string
  photo_url: string | null
  availability_status: string | null
  skill_tags: string[]
  functional_role: string | null
}
```

Do NOT include `hourly_rate`, `daily_rate`, `monthly_rate`, `bank_name`, `bank_account_number`, `ewallet_type`, `ewallet_number` in this query.

### 5. Add a Manajer-specific Team view component

Create: `components/modules/team/TeamAvailabilityView.tsx`

This component receives `TeamAvailabilityRow[]` and renders a simple availability roster:

```tsx
'use client'

import type { TeamAvailabilityRow } from '@/lib/team/queries' // adjust import path

const AVAILABILITY_LABEL: Record<string, string> = {
  available: 'Tersedia',
  partially_available: 'Sebagian',
  unavailable: 'Tidak tersedia',
  on_leave: 'Cuti',
}

const AVAILABILITY_COLOR: Record<string, string> = {
  available: 'var(--color-success)',
  partially_available: 'var(--color-warning)',
  unavailable: 'var(--color-danger)',
  on_leave: 'var(--color-text-muted)',
}

export function TeamAvailabilityView({ members }: { members: TeamAvailabilityRow[] }) {
  if (members.length === 0) {
    return (
      <div className="py-16 text-center text-[var(--color-text-muted)]">
        Belum ada anggota tim aktif.
      </div>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((m) => {
        const status = m.availability_status ?? 'unavailable'
        const color = AVAILABILITY_COLOR[status] ?? 'var(--color-text-muted)'
        const label = AVAILABILITY_LABEL[status] ?? status

        return (
          <div
            key={m.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <div className="flex items-center gap-3">
              {m.photo_url ? (
                <img
                  src={m.photo_url}
                  alt={m.full_name}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {m.full_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="truncate text-[0.875rem] font-semibold text-[var(--color-text-primary)]">
                  {m.full_name}
                </div>
                {m.functional_role && (
                  <div className="truncate text-[0.75rem] text-[var(--color-text-muted)]">
                    {m.functional_role}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-[0.8125rem] font-medium" style={{ color }}>
                {label}
              </span>
            </div>

            {m.skill_tags && m.skill_tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {m.skill_tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface-muted)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
                {m.skill_tags.length > 3 && (
                  <span className="text-[0.6875rem] text-[var(--color-text-muted)]">
                    +{m.skill_tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### 6. Update the Team page to branch by role

In the Team page (`app/(protected)/team/page.tsx` or wherever it lives):

```ts
import { canAccessTeam, canViewTeamAvailability } from '@/lib/auth/permissions'
import { getSessionProfile } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { getTeamAvailabilityForManajer } from '@/lib/team/queries' // adjust path
import { TeamAvailabilityView } from '@/components/modules/team/TeamAvailabilityView'

export default async function TeamPage() {
  const profile = await getSessionProfile()
  const role = profile.system_role

  // Check access
  if (!canAccessTeam(role) && !canViewTeamAvailability(role)) {
    redirect('/access-denied')
  }

  // Manajer gets limited view
  if (canViewTeamAvailability(role)) {
    const members = await getTeamAvailabilityForManajer()
    return (
      <div className="page-content">
        <PageHeader
          title="Tim"
          subtitle="Ketersediaan anggota tim untuk perencanaan proyek."
        />
        <TeamAvailabilityView members={members} />
      </div>
    )
  }

  // Full view for Direktur, TD, Finance — existing code below
  // ... (keep existing implementation unchanged)
}
```

### 7. Update Supabase RLS (if needed)

Check if the `profiles` table has RLS policies that would block Manajer from reading other profiles' availability.

Run in Supabase SQL Editor:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'profiles';
```

If Manajer can only read their own profile row, add a policy:
```sql
CREATE POLICY "profiles: manajer can read availability fields"
  ON public.profiles FOR SELECT TO authenticated
  USING (
    public.get_my_role() = 'manajer'
  );
```

However, this gives Manajer SELECT on the whole profiles row. If that's too broad, use a view instead:

```sql
CREATE OR REPLACE VIEW public.team_availability AS
SELECT
  id,
  full_name,
  photo_url,
  availability_status,
  skill_tags,
  active_status,
  functional_role
FROM public.profiles
WHERE active_status = 'active';

ALTER VIEW public.team_availability OWNER TO postgres;

GRANT SELECT ON public.team_availability TO authenticated;
```

Then update the `getTeamAvailabilityForManajer()` query to use `.from('team_availability')` instead of `.from('profiles')`.

---

## What NOT to Change

- Do NOT change `canAccessTeam` — Direktur/TD/Finance keep their full access
- Do NOT expose any financial fields (rates, banking) to Manajer
- Do NOT change any existing full team management UI used by TD/Direktur/Finance
- Do NOT change RLS policies that protect financial data

---

## Verification

1. Run `npx tsc --noEmit` — zero errors
2. Log in as **Manajer**
3. Sidebar should show the "Tim" nav item
4. `/team` should show the availability-only grid view (names, availability dots, skill tags)
5. No rates or banking information should be visible
6. Log in as **Technical Director** → `/team` should still show the full management view unchanged
7. Log in as **BD** → `/team` should redirect to `/access-denied`
