# Phase 03 — Project Notes + Client Portal + Burndown Chart

> Baca `BRIEFING.md` dulu sebelum mulai.
> Kerjakan setiap fitur secara berurutan.
> Estimasi: 2–3 minggu

---

## Gambaran Phase Ini

1. **[Fitur A]** Project Notes — catatan teknis free-form per project
2. **[Fitur B]** Client Portal — halaman read-only untuk client lihat progress
3. **[Fitur C]** Burndown Chart — grafik sisa task vs waktu per phase/project

---

# FITUR A — Project Notes (Wiki ringan per project)

## Konteks

Tidak ada tempat untuk menyimpan catatan teknis per project. Tim pakai Notion atau Google Docs eksternal yang tidak terhubung ke project. Kita perlu tab "Notes" di dalam project detail.

## Library yang Dipakai

Install `@blocknote/react` dan `@blocknote/core` (MIT license, gratis):
```bash
npm install @blocknote/react @blocknote/core @blocknote/mantine
```

Alternatif kalau BlockNote bermasalah: pakai `@lexical/react` (by Meta, MIT).

## Step A1 — Database Migration

Buat `supabase/migrations/XXXX_project_notes.sql`:

```sql
-- ============================================================
-- PROJECT NOTES
-- Satu project bisa punya banyak notes/halaman
-- ============================================================

create table if not exists public.project_notes (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  title       text not null default 'Untitled' check (char_length(title) <= 200),
  content     jsonb,           -- Disimpan sebagai JSON (format BlockNote/ProseMirror)
  content_text text,           -- Plain text version untuk search
  created_by  uuid references public.profiles(id),
  updated_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index project_notes_project_id_idx on public.project_notes(project_id);
create index project_notes_created_at_idx on public.project_notes(project_id, created_at desc);

create trigger project_notes_updated_at
  before update on public.project_notes
  for each row execute function public.set_updated_at();

-- RLS
alter table public.project_notes enable row level security;

-- Semua user yang sudah login bisa baca
create policy "project_notes_select"
  on public.project_notes for select
  to authenticated using (true);

-- Engineer/manajer ke atas bisa tambah dan edit
create policy "project_notes_insert"
  on public.project_notes for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer', 'engineer')
    )
  );

create policy "project_notes_update"
  on public.project_notes for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer', 'engineer')
    )
  );

-- Hanya direktur dan TD yang bisa hapus
create policy "project_notes_delete"
  on public.project_notes for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director')
    )
  );
```

## Step A2 — Query & Actions

Buat `lib/project-notes/queries.ts`:

```ts
import { createServerClient } from '@/lib/supabase/server'

export type ProjectNote = {
  id: string
  project_id: string
  title: string
  content: Record<string, unknown> | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  author: { full_name: string } | null
  editor: { full_name: string } | null
}

export async function getProjectNotes(projectId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('project_notes')
    .select(`
      id, project_id, title, content, created_by, updated_by, created_at, updated_at,
      author:profiles!created_by(full_name),
      editor:profiles!updated_by(full_name)
    `)
    .eq('project_id', projectId)
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getProjectNote(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('project_notes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}
```

Buat `lib/project-notes/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function createProjectNote(projectId: string, title: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('project_notes')
    .insert({ project_id: projectId, title, created_by: user.id, updated_by: user.id })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
  return { ok: true, id: data.id }
}

export async function updateProjectNote(id: string, input: {
  title?: string
  content?: Record<string, unknown>
  contentText?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('project_notes')
    .update({
      ...(input.title !== undefined && { title: input.title }),
      ...(input.content !== undefined && { content: input.content }),
      ...(input.contentText !== undefined && { content_text: input.contentText }),
      updated_by: user.id,
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function deleteProjectNote(id: string, projectId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('project_notes').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}
```

## Step A3 — Komponen Notes

Buat `components/modules/projects/ProjectNotes.tsx`.

Tampilan yang diinginkan (dua panel):
```
┌─ Daftar Notes ──┬─── Editor ─────────────────────────────────┐
│                 │                                            │
│ + Note Baru     │  [ Judul Note ]                            │
│                 │                                            │
│ Meeting Notes   │  Ketik di sini... (BlockNote editor)       │
│ Design Brief    │                                            │
│ Checklist SD    │                                            │
│                 │  Terakhir diedit: 2 jam lalu oleh Budi     │
└─────────────────┴────────────────────────────────────────────┘
```

Catatan implementasi:
- Kiri: list notes, klik untuk load di panel kanan
- Kanan: editor BlockNote — auto-save setiap 2 detik setelah user berhenti mengetik (pakai `useDebounce`)
- Tombol "+ Note Baru" buat note dengan judul "Untitled" lalu langsung buka di editor
- Judul note bisa diedit langsung (inline, klik untuk edit)
- Gunakan `useDebounce` dari `lib/hooks/useDebounce.ts` (sudah ada di Docs, buat juga di OS kalau belum ada)

## Step A4 — Pasang di Project Detail

Buka `app/(protected)/projects/[id]/page.tsx`.

Tambahkan tab "Notes". Fetch data:
```ts
const notes = await getProjectNotes(params.id)
```

Render `<ProjectNotes notes={notes} projectId={params.id} />`

---

# FITUR B — Client Portal

## Konteks

Client tidak punya akses ke OS. Mereka harus tanya tim via WA/email untuk tahu status project. Kita perlu halaman read-only yang bisa diakses client dengan link khusus.

## Pendekatan

Buat token akses per project yang bisa di-share ke client. Token di-generate oleh PM, client buka URL: `/portal/[token]`.

Tidak perlu login — halaman ini **public tapi protected oleh token**.

## Step B1 — Database Migration

Buat `supabase/migrations/XXXX_client_portal_tokens.sql`:

```sql
-- ============================================================
-- CLIENT PORTAL TOKENS
-- Token unik per project untuk akses client portal
-- ============================================================

create table if not exists public.client_portal_tokens (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  token       text not null unique default encode(gen_random_bytes(32), 'hex'),
  label       text,            -- Nama/deskripsi (misal: "Link untuk PT Maju Jaya")
  expires_at  timestamptz,     -- null = tidak expired
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  last_accessed_at timestamptz
);

create index client_portal_tokens_project_id_idx on public.client_portal_tokens(project_id);
create index client_portal_tokens_token_idx on public.client_portal_tokens(token);

-- RLS: portal tokens hanya bisa dibaca/dibuat oleh user login
alter table public.client_portal_tokens enable row level security;

create policy "portal_tokens_select"
  on public.client_portal_tokens for select
  to authenticated using (true);

create policy "portal_tokens_insert"
  on public.client_portal_tokens for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer')
    )
  );

create policy "portal_tokens_update"
  on public.client_portal_tokens for update
  to authenticated
  using (true);

create policy "portal_tokens_delete"
  on public.client_portal_tokens for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer')
    )
  );
```

## Step B2 — Halaman Portal (Public)

Buat route baru: `app/portal/[token]/page.tsx`

**PENTING:** Halaman ini ada di luar route group `(protected)`. Tidak butuh login.

```ts
// app/portal/[token]/page.tsx
import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'

export default async function ClientPortalPage({ params }: { params: { token: string } }) {
  const supabase = await createServerClient()

  // Cari token
  const { data: portalToken } = await supabase
    .from('client_portal_tokens')
    .select('*, project:projects(*)')
    .eq('token', params.token)
    .eq('is_active', true)
    .single()

  if (!portalToken) return notFound()

  // Cek expired
  if (portalToken.expires_at && new Date(portalToken.expires_at) < new Date()) {
    return (
      <div>Link ini sudah kadaluarsa. Hubungi tim Reka untuk link terbaru.</div>
    )
  }

  // Update last_accessed_at
  await supabase
    .from('client_portal_tokens')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('id', portalToken.id)

  const project = portalToken.project

  // Fetch data untuk ditampilkan ke client
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, status, due_date, priority')
    .eq('project_id', project.id)
    .order('created_at')

  const { data: deliverables } = await supabase
    .from('deliverables')
    .select('id, name, status, due_date, type')
    .eq('project_id', project.id)
    .order('created_at')

  return <ClientPortalView project={project} tasks={tasks ?? []} deliverables={deliverables ?? []} />
}
```

## Step B3 — Komponen ClientPortalView

Buat `components/modules/portal/ClientPortalView.tsx`.

Isi halaman:
- Header: Logo Reka + nama project + nama client
- Section Progress: progress bar overall (% task done)
- Section Tasks: tabel sederhana (nama task, status, due date) — **TIDAK tampilkan assignee atau detail internal**
- Section Deliverables: tabel (nama deliverable, tipe, status, due date)
- Footer: "Powered by Reka Engineering OS" + tanggal terakhir update

Yang **TIDAK boleh ditampilkan** ke client:
- Nama staff yang di-assign ke task
- Komentar internal
- Kompensasi, invoice, payslip
- Notes internal

Styling: bisa lebih "bersih" dan branded dibanding internal app. Gunakan warna Reka dan logo kalau ada.

## Step B4 — Manajemen Token di Project Detail

Buat `components/modules/projects/ClientPortalManager.tsx`.

Tampilkan di tab atau section di dalam project detail (hanya untuk direktur/manajer):

```
Client Portal Links
───────────────────────────────────────────
Link 1: "PT Maju Jaya"     [Copy Link] [Nonaktifkan]
  Dibuat: 10 Jan 2026 | Terakhir diakses: 2 Jan tadi

[+ Generate Link Baru]
```

Tombol "+ Generate Link Baru" akan buat token baru dan langsung copy URL ke clipboard.

---

# FITUR C — Burndown Chart

## Konteks

Tidak ada cara visual untuk lihat apakah project on-track atau ketinggalan. Burndown chart menampilkan: sumbu X = tanggal, sumbu Y = jumlah task yang belum selesai. Kalau garis burndown mengikuti garis ideal, project on-track.

## Library

Recharts sudah terpasang. Tidak perlu install apapun.

## Step C1 — Query Data Burndown

Buat `lib/projects/burndown-queries.ts`:

```ts
import { createServerClient } from '@/lib/supabase/server'

export type BurndownPoint = {
  date: string      // 'YYYY-MM-DD'
  remaining: number // jumlah task belum done
  ideal: number     // garis ideal (linear dari total ke 0)
}

export async function getProjectBurndown(
  projectId: string,
  startDate: string,
  endDate: string
): Promise<BurndownPoint[]> {
  const supabase = await createServerClient()

  // Ambil semua task dalam project dengan tanggal selesainya
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, status, updated_at, due_date')
    .eq('project_id', projectId)

  if (error) throw error
  if (!tasks || tasks.length === 0) return []

  const total = tasks.length
  const start = new Date(startDate)
  const end = new Date(endDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  const points: BurndownPoint[] = []

  // Generate titik per hari dari start sampai hari ini (atau end)
  const today = new Date()
  const limitDate = today < end ? today : end

  for (let i = 0; i <= totalDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    if (date > limitDate) break

    // Hitung task yang belum done pada tanggal ini
    const doneBefore = tasks.filter(t =>
      t.status === 'done' &&
      t.updated_at &&
      t.updated_at.split('T')[0] <= dateStr
    ).length

    const remaining = total - doneBefore
    const ideal = Math.round(total - (total * (i / totalDays)))

    points.push({ date: dateStr, remaining, ideal })
  }

  return points
}
```

## Step C2 — Komponen BurndownChart

Buat `components/modules/projects/BurndownChart.tsx`:

```tsx
'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import type { BurndownPoint } from '@/lib/projects/burndown-queries'
import { formatDate } from '@/lib/utils/formatters'

interface BurndownChartProps {
  data: BurndownPoint[]
  totalTasks: number
}

export function BurndownChart({ data, totalTasks }: BurndownChartProps) {
  if (data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
        Belum ada data untuk burndown chart. Pastikan project punya tanggal mulai dan selesai.
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '8px', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
        Total task: {totalTasks}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(val) => formatDate(val)}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            domain={[0, totalTasks]}
          />
          <Tooltip
            labelFormatter={(val) => formatDate(val as string)}
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '0.8125rem',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="var(--color-primary)"
            strokeWidth={2}
            dot={false}
            name="Task Tersisa"
          />
          <Line
            type="monotone"
            dataKey="ideal"
            stroke="var(--color-text-muted)"
            strokeWidth={1}
            strokeDasharray="5 5"
            dot={false}
            name="Ideal"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
```

## Step C3 — Pasang di Project Detail

Buka `app/(protected)/projects/[id]/page.tsx`.

Cek apakah project punya `start_date` dan `end_date` (atau pakai `created_at` dan deadline project).

```ts
// Di server component:
let burndownData: BurndownPoint[] = []
if (project.start_date && project.deadline) {
  burndownData = await getProjectBurndown(project.id, project.start_date, project.deadline)
}
```

Tambahkan `<BurndownChart data={burndownData} totalTasks={tasks.length} />` di tab atau section Analytics project.

---

## Checklist Sebelum Selesai

### Fitur A — Project Notes
- [ ] Migration `project_notes` berhasil
- [ ] Bisa buat note baru di project
- [ ] Editor BlockNote berfungsi (bisa format teks, heading, bullet)
- [ ] Auto-save berjalan (tidak perlu klik Save)
- [ ] Bisa ganti judul note
- [ ] Bisa hapus note

### Fitur B — Client Portal
- [ ] Migration `client_portal_tokens` berhasil
- [ ] PM bisa generate portal link di project
- [ ] Halaman `/portal/[token]` accessible tanpa login
- [ ] Data sensitif (assignee, invoice, dll) tidak tampil di portal
- [ ] Token yang tidak aktif atau kadaluarsa redirect ke pesan error
- [ ] `last_accessed_at` ter-update saat client buka link

### Fitur C — Burndown Chart
- [ ] Chart muncul di halaman project
- [ ] Ada dua garis: actual (biru) dan ideal (abu-abu putus-putus)
- [ ] Sumbu X = tanggal, sumbu Y = jumlah task
- [ ] Kalau data kosong, muncul pesan info yang jelas
- [ ] Chart responsive (muat di layar kecil)
