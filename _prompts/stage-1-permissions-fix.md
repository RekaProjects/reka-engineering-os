# Stage 1 — Fix Role Permissions

## Context

This is a **Next.js 15 App Router + TypeScript strict + Supabase** project called Reka Engineering OS.
The app has 8 system roles: `direktur`, `technical_director`, `finance`, `manajer`, `bd`, `senior`, `member`, `freelancer`.

Role predicates and access gates live in **one file**: `lib/auth/permissions.ts`.  
The sidebar nav is driven by `getNavPermissions()` in the same file.

---

## Problem

Three access predicates are wrong compared to the system design spec:

| Predicate | Current (wrong) | Correct per spec |
|---|---|---|
| `canAccessFxRates` | `isDirektur \|\| isFinance \|\| isTD` | `isDirektur \|\| isFinance` — TD has **no** access to FX rates |
| `canAccessPaymentAccounts` | `isDirektur \|\| isFinance \|\| isTD` | `isDirektur \|\| isFinance` — TD has **no** access to payment accounts |
| `canAccessSettings` | `isTD \|\| isFinance \|\| isDirektur` | `isTD \|\| isDirektur` — Finance has **no** access to the Settings page |

**Why it matters:**
- `showFxRates` and `showPaymentAccounts` in the sidebar nav are derived from these predicates — so TD incorrectly sees those nav items.
- `showSettings` is derived from `canAccessSettings` — so Finance incorrectly sees the Settings nav item.
- The design spec says: Finance module is accessed by Finance/Direktur via **dedicated pages** (`/finance/fx-rates`, `/finance/payment-accounts`), not via Settings. TD is purely technical and has no visibility into financial configuration.

---

## Files to Edit

### 1. `lib/auth/permissions.ts`

Find and fix these three functions (lines ~75–77):

```ts
// BEFORE (wrong):
export const canAccessFxRates = (r?: SystemRole | null) => isDirektur(r) || isFinance(r) || isTD(r)
export const canAccessPaymentAccounts = (r?: SystemRole | null) => isDirektur(r) || isFinance(r) || isTD(r)
export const canAccessSettings = (r?: SystemRole | null) =>
  isTD(r) || isFinance(r) || isDirektur(r)

// AFTER (correct):
export const canAccessFxRates = (r?: SystemRole | null) => isDirektur(r) || isFinance(r)
export const canAccessPaymentAccounts = (r?: SystemRole | null) => isDirektur(r) || isFinance(r)
export const canAccessSettings = (r?: SystemRole | null) => isTD(r) || isDirektur(r)
```

Do NOT change anything else in this file. The `getNavPermissions()` function at the bottom of the file already calls `canAccessFxRates`, `canAccessPaymentAccounts`, and `canAccessSettings` by reference — the nav will automatically fix itself.

---

### 2. `app/(protected)/settings/page.tsx`

This file has a local `canViewFinance` variable on line ~48 that independently checks Finance access to the Settings page's finance tab. After fixing `canAccessSettings`, Finance users will be redirected to `/access-denied` before even reaching this logic — which is correct per spec.

However, there's still a reference that explicitly adds Finance:
```ts
// BEFORE (line ~48):
const canViewFinance = isFinance(sp.system_role) || isDirektur(sp.system_role) || isTD(sp.system_role)
```

Change it to:
```ts
// AFTER:
const canViewFinance = isDirektur(sp.system_role) || isTD(sp.system_role)
```

**Important:** Finance still accesses FX rates and payment accounts via `/finance/fx-rates` and `/finance/payment-accounts` (separate pages in the finance module). Those pages use `canAccessFxRates` and `canAccessPaymentAccounts` respectively — which Finance still has. This settings page change only removes Finance from the system-config Settings tab.

Also on line ~80:
```ts
// BEFORE:
const financeCanMutate = isFinance(sp.system_role)
```
Keep this line as-is — it's only referenced inside the `tab === 'finance'` block which Finance won't reach anymore, so it's harmless but cleaner to leave it.

---

## What NOT to Change

- Do NOT touch any other predicates in `permissions.ts`
- Do NOT touch RLS policies in Supabase migrations
- Do NOT change the `/finance/fx-rates` or `/finance/payment-accounts` pages — Finance still needs those
- Do NOT change `canAccessCompensation`, `canAccessInvoices`, `canAccessPayslips` — those are correct
- Do NOT change `canAccessTeam` — that's a separate issue handled in Stage 4

---

## Verification

After making changes:

1. Run `npx tsc --noEmit` — must pass with zero errors.
2. Start the dev server: `npm run dev`
3. Log in as **Technical Director** role → check sidebar nav: FX Rates and Payment Accounts links should be **gone**. Settings should still appear.
4. Log in as **Finance** role → check sidebar nav: Settings link should be **gone**. FX Rates and Payment Accounts links should still appear. `/finance/fx-rates` and `/finance/payment-accounts` should still be accessible.
5. Log in as **Direktur** → Settings, FX Rates, Payment Accounts should all still appear.

If you cannot test with multiple roles, just do the TypeScript check and verify the logic reads correctly.
