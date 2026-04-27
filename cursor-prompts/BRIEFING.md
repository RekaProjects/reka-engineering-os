# BRIEFING — Reka Engineering OS

> Baca file ini dulu sebelum mengerjakan phase apapun. Ini adalah konteks utama proyek.

---

## Apa Itu Aplikasi Ini?

**Reka Engineering OS** adalah platform operasional internal untuk perusahaan engineering consultancy bernama Reka. Aplikasi ini mengelola seluruh lifecycle bisnis:

```
Leads → Client → Intake → Project → Task → Deliverable → Invoice → Payslip
```

Ini **bukan** aplikasi publik. Ini internal tool untuk tim Reka sendiri.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15, App Router, TypeScript 5 |
| UI | React 19, Radix UI, Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) — schema `public` |
| Auth | Supabase Auth + SSR (PKCE flow) |
| File Storage | Cloudflare R2 via `@aws-sdk/client-s3` |
| Email | Resend |
| PDF | @react-pdf/renderer |
| Chart | Recharts |
| Drag & Drop | @dnd-kit/core, @dnd-kit/sortable |
| Icons | Lucide React |

---

## Struktur Folder

```
app/
  (protected)/          ← Semua halaman butuh login
    dashboard/
    clients/
    projects/
    tasks/
    deliverables/
    files/
    finance/
    payments/
    compensation/
    invoices/
    payslips/
    leads/
    intakes/
    outreach/
    expenses/
    work-logs/
    team/
    my-profile/
    my-payments/
    settings/
    search/
  api/                  ← Route handlers
    email/notify/
    files/upload/ & download/
    integrations/google/
    invoices/[id]/pdf/
    payslips/[id]/pdf/
    profile/photo/

components/
  layout/               ← AppSidebar, AppTopbar, NotificationsBell, dll
  modules/              ← Komponen per fitur (clients/, projects/, tasks/, dll)
  shared/               ← KanbanBoard, PriorityBadge, dll (reusable)
  ui/                   ← Radix-based primitives (button, dialog, input, dll)

lib/
  [fitur]/
    queries.ts          ← Fungsi baca data dari Supabase (async, server)
    actions.ts          ← Server Actions ('use server') untuk mutasi data
  auth/                 ← Permission, session, access control
  supabase/
    server.ts           ← createServerClient() — pakai di server components & actions
    client.ts           ← createClient() — pakai di 'use client' components
  utils/
    formatters.ts       ← formatDate, formatIDR, dll
    cn.ts               ← className utility

supabase/
  migrations/           ← SQL migration files (0001 s/d 0041+)
```

---

## Konvensi Penting — WAJIB DIIKUTI

### 1. Server Actions
Semua mutasi data (insert/update/delete) pakai **Server Actions** di `lib/[fitur]/actions.ts`:
```ts
'use server'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSomething(data: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  // ... insert ke supabase
  revalidatePath('/halaman-terkait')
  return { ok: true }
}
```

### 2. Queries
Semua query baca data di `lib/[fitur]/queries.ts`:
```ts
import { createServerClient } from '@/lib/supabase/server'

export async function getSesuatu(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('nama_tabel')
    .select('*, relasi(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
```

### 3. Komponen UI
- Pakai komponen dari `@/components/ui/` (button, dialog, input, select, dll)
- Styling pakai CSS variables: `var(--color-surface)`, `var(--color-border)`, `var(--color-text-primary)`, dll
- **Jangan pakai hardcoded hex color** — selalu pakai CSS variable
- Icon dari `lucide-react`
- Komponen per fitur masuk ke `components/modules/[fitur]/`

### 4. Database Migrations
Setiap perubahan schema **WAJIB** dibuatkan file migration di `supabase/migrations/`:
- Nama file: `XXXX_nama_fitur.sql` (XXXX = nomor urut setelah migration terakhir)
- Migration terakhir saat ini: cek nomor tertinggi di folder `supabase/migrations/`
- Selalu include RLS policies
- Selalu include index untuk foreign key dan kolom yang sering di-filter

### 5. Auth & Permission
```ts
// Di server component atau action:
const supabase = await createServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) redirect('/login')

// Cek role:
import { getUserPermissions } from '@/lib/auth/permissions'
const perms = await getUserPermissions(supabase, user.id)
```

### 6. Realtime (Supabase)
Untuk fitur yang butuh update real-time, pakai Supabase Realtime di custom hook:
```ts
// Lihat contoh: hooks/useRealtimeNotifications.ts
```

---

## Fitur yang SUDAH ADA — Jangan Dibangun Ulang

| Fitur | File |
|---|---|
| Kanban board Tasks | `components/modules/tasks/TasksKanban.tsx` |
| Kanban board Projects | `components/modules/projects/ProjectsKanban.tsx` |
| Shared KanbanBoard component | `components/shared/KanbanBoard.tsx` |
| In-app Notification Bell | `components/layout/NotificationsBell.tsx` |
| Realtime notification hook | `hooks/useRealtimeNotifications.ts` |
| Notification actions | `lib/notifications/actions.ts` |
| Invoice PDF | `app/api/invoices/[id]/pdf/route.ts` |
| Payslip PDF | `app/api/payslips/[id]/pdf/route.ts` |
| File upload/download (R2) | `lib/files/r2.ts`, `lib/files/r2-service.ts` |
| Google Drive integration | `lib/files/drive-service.ts` |
| Email via Resend | `lib/email/` |
| Dashboard per role | `components/modules/dashboard/` |

---

## Aplikasi Kedua — Reka Engineering Document

Ada app terpisah di `D:\Reka Projects\reka-engineering-document` yang jalan di port 3001.

Relasi ke OS:
- **Supabase project yang sama** — OS pakai schema `public`, Docs pakai schema `engdocs`
- **R2 bucket yang sama** — OS prefix `os/`, Docs prefix `docs/`
- **Auth yang sama** — user login sekali, berlaku di kedua app
- Tabel `engdocs.library_profile_roles` punya FK ke `public.profiles`

---

## Role User yang Ada

| Role | Akses |
|---|---|
| `direktur` | Full access semua fitur |
| `technical_director` | Project, task, deliverable, team |
| `manajer` | Project, task, client |
| `engineer` | Task yang di-assign, work log sendiri |
| `finance` | Invoice, payslip, payment, compensation |
| `bd` | Leads, client, outreach, intake |
| `freelancer` | Task yang di-assign saja |

---

## Environment Variables yang Dibutuhkan

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLOUDFLARE_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=
RESEND_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
```

---

## Cara Jalankan Dev Server

```bash
npm run dev        # port 3000
npm run build      # production build
npx supabase migration new nama_migration  # buat migration baru
```
