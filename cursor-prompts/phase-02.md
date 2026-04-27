# Phase 02 — Gantt Timeline + Phase Planning + Notifikasi Terhubung

> Baca `BRIEFING.md` dulu sebelum mulai.
> Kerjakan setiap step secara berurutan. Jangan loncat.
> Estimasi: 2–3 minggu

---

## Gambaran Phase Ini

Phase ini terdiri dari 3 fitur terpisah. Kerjakan satu per satu:

1. **[Step A]** Gantt / Timeline view per project
2. **[Step B]** Phase / Sprint planning per project
3. **[Step C]** Notifikasi OS terhubung ke notifikasi Docs

---

# FITUR A — Gantt Timeline View

## Konteks

Sekarang di halaman detail project (`/projects/[id]`) ada tab Tasks yang menampilkan tabel. Kita akan tambah tab baru "Timeline" yang menampilkan Gantt chart dari task-task dalam project tersebut.

## Library yang Dipakai

Install `frappe-gantt` (MIT license, gratis):
```bash
npm install frappe-gantt
npm install -D @types/frappe-gantt
```

Catatan: `frappe-gantt` adalah vanilla JS library, kita perlu bungkus dalam React wrapper.

## Step A1 — Buat React Wrapper untuk frappe-gantt

Buat file `components/shared/GanttChart.tsx`:

```tsx
'use client'

import { useEffect, useRef } from 'react'
import Gantt from 'frappe-gantt'

export type GanttTask = {
  id: string
  name: string
  start: string       // format: 'YYYY-MM-DD'
  end: string         // format: 'YYYY-MM-DD'
  progress: number    // 0–100
  dependencies?: string  // comma-separated id, contoh: 'task-1,task-2'
  custom_class?: string  // untuk styling khusus
}

interface GanttChartProps {
  tasks: GanttTask[]
  viewMode?: 'Day' | 'Week' | 'Month'
  onTaskClick?: (task: GanttTask) => void
  onDateChange?: (task: GanttTask, start: Date, end: Date) => void
}

export function GanttChart({
  tasks,
  viewMode = 'Week',
  onTaskClick,
  onDateChange,
}: GanttChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const ganttRef = useRef<Gantt | null>(null)

  useEffect(() => {
    if (!containerRef.current || tasks.length === 0) return

    // Bersihkan instance lama
    containerRef.current.innerHTML = '<svg></svg>'

    ganttRef.current = new Gantt(containerRef.current.querySelector('svg')!, tasks, {
      view_mode: viewMode,
      date_format: 'YYYY-MM-DD',
      on_click: onTaskClick ?? (() => {}),
      on_date_change: onDateChange ?? (() => {}),
    })

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [tasks, viewMode])

  if (tasks.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: '0.875rem',
      }}>
        Belum ada task dengan tanggal mulai dan selesai. Tambahkan due date di task untuk melihat timeline.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="gantt-container"
      style={{ overflowX: 'auto', width: '100%' }}
    >
      <svg></svg>
    </div>
  )
}
```

Tambahkan CSS untuk frappe-gantt di `app/globals.css` atau file CSS global:
```css
@import 'frappe-gantt/dist/frappe-gantt.css';

/* Override warna agar sesuai tema Reka */
.gantt .bar {
  fill: var(--color-primary);
}
.gantt .bar-progress {
  fill: var(--color-primary-dark, #4f46e5);
}
.gantt .bar-label {
  fill: var(--color-text-primary);
}
```

## Step A2 — Buat Komponen ProjectGantt

Buat file `components/modules/projects/ProjectGantt.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GanttChart, type GanttTask } from '@/components/shared/GanttChart'
import type { TaskWithRelations } from '@/lib/tasks/queries'

// Map status task ke progress number
const STATUS_PROGRESS: Record<string, number> = {
  to_do: 0,
  in_progress: 25,
  review: 75,
  revision: 50,
  blocked: 10,
  done: 100,
}

interface ProjectGanttProps {
  tasks: TaskWithRelations[]
  projectId: string
}

export function ProjectGantt({ tasks, projectId }: ProjectGanttProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Week')

  // Filter task yang punya start_date dan due_date
  // Kalau task belum punya start_date, pakai created_at sebagai fallback
  const ganttTasks: GanttTask[] = tasks
    .filter(t => t.due_date) // minimal harus ada due_date
    .map(t => ({
      id: t.id,
      name: t.title,
      start: t.start_date ?? t.created_at.split('T')[0],
      end: t.due_date!,
      progress: STATUS_PROGRESS[t.status] ?? 0,
      custom_class: t.is_problematic ? 'task-problematic' : t.status === 'done' ? 'task-done' : '',
    }))

  return (
    <div>
      {/* View Mode Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['Day', 'Week', 'Month'] as const).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: '4px 12px',
              fontSize: '0.8125rem',
              fontWeight: viewMode === mode ? 600 : 400,
              borderRadius: 'var(--radius-sm)',
              border: `1px solid ${viewMode === mode ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: viewMode === mode ? 'var(--color-primary)' : 'transparent',
              color: viewMode === mode ? 'var(--color-primary-fg)' : 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {mode}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-muted)', alignSelf: 'center' }}>
          {ganttTasks.length} task dengan timeline
        </span>
      </div>

      <GanttChart
        tasks={ganttTasks}
        viewMode={viewMode}
        onTaskClick={(task) => router.push(`/tasks/${task.id}`)}
      />

      {tasks.length > ganttTasks.length && (
        <p style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          {tasks.length - ganttTasks.length} task tidak ditampilkan karena belum punya due date.
        </p>
      )}
    </div>
  )
}
```

## Step A3 — Tambahkan ke Halaman Project Detail

Buka `app/(protected)/projects/[id]/page.tsx`.

1. Cek apakah halaman ini sudah punya tab/section untuk tasks
2. Tambahkan tab "Timeline" di sebelah tab "Tasks" yang ada
3. Di tab Timeline, render komponen `<ProjectGantt tasks={tasks} projectId={project.id} />`
4. Tasks sudah di-fetch di halaman ini — tidak perlu query tambahan

Perhatikan: tasks butuh `start_date`. Cek apakah kolom ini sudah ada di tabel `tasks`. Kalau belum ada, buat migration:

```sql
-- supabase/migrations/XXXX_tasks_add_start_date.sql
alter table public.tasks
  add column if not exists start_date date;
```

---

# FITUR B — Phase / Sprint Planning

## Konteks

Sekarang task dalam project berdiri sendiri tanpa pengelompokan. Kita perlu sistem "phases" — cara untuk group task dalam periode tertentu. Contoh untuk engineering project:

```
Phase SD (Schematic Design) — 1 Feb s/d 28 Feb
  → Task: Denah lantai 1
  → Task: Denah lantai 2

Phase DD (Design Development) — 1 Mar s/d 31 Mar  
  → Task: Detail struktur
  → Task: MEP layout
```

## Step B1 — Database Migration

Buat `supabase/migrations/XXXX_project_phases.sql`:

```sql
-- ============================================================
-- PROJECT PHASES
-- ============================================================

create table if not exists public.project_phases (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null check (char_length(name) >= 1 and char_length(name) <= 100),
  description text,
  start_date  date,
  end_date    date,
  status      text not null default 'active'
              check (status in ('active', 'completed', 'on_hold')),
  sort_order  integer not null default 0,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Hubungkan task ke phase (opsional, task boleh tidak punya phase)
alter table public.tasks
  add column if not exists phase_id uuid references public.project_phases(id) on delete set null;

-- Index
create index project_phases_project_id_idx on public.project_phases(project_id);
create index project_phases_sort_order_idx on public.project_phases(project_id, sort_order);
create index tasks_phase_id_idx on public.tasks(phase_id) where phase_id is not null;

-- Auto-update timestamp
create trigger project_phases_updated_at
  before update on public.project_phases
  for each row execute function public.set_updated_at();

-- RLS
alter table public.project_phases enable row level security;

create policy "project_phases_select"
  on public.project_phases for select
  to authenticated using (true);

create policy "project_phases_insert"
  on public.project_phases for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer')
    )
  );

create policy "project_phases_update"
  on public.project_phases for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director', 'manajer')
    )
  );

create policy "project_phases_delete"
  on public.project_phases for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director')
    )
  );
```

## Step B2 — Query & Actions

Buat `lib/phases/queries.ts`:

```ts
import { createServerClient } from '@/lib/supabase/server'

export type ProjectPhase = {
  id: string
  project_id: string
  name: string
  description: string | null
  start_date: string | null
  end_date: string | null
  status: 'active' | 'completed' | 'on_hold'
  sort_order: number
  created_at: string
}

export async function getProjectPhases(projectId: string): Promise<ProjectPhase[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('project_phases')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data ?? []
}
```

Buat `lib/phases/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

export async function createPhase(input: {
  projectId: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('project_phases').insert({
    project_id: input.projectId,
    name: input.name.trim(),
    description: input.description?.trim() ?? null,
    start_date: input.startDate ?? null,
    end_date: input.endDate ?? null,
    created_by: user.id,
  })

  if (error) return { error: error.message }
  revalidatePath(`/projects/${input.projectId}`)
  return { ok: true }
}

export async function updatePhase(id: string, input: {
  name?: string
  description?: string
  startDate?: string
  endDate?: string
  status?: 'active' | 'completed' | 'on_hold'
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('project_phases')
    .update({
      ...(input.name && { name: input.name.trim() }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.startDate !== undefined && { start_date: input.startDate }),
      ...(input.endDate !== undefined && { end_date: input.endDate }),
      ...(input.status && { status: input.status }),
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function deletePhase(id: string, projectId: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Tasks yang ada di phase ini akan set phase_id = null (karena on delete set null)
  const { error } = await supabase.from('project_phases').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { ok: true }
}

export async function assignTaskToPhase(taskId: string, phaseId: string | null) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('tasks')
    .update({ phase_id: phaseId })
    .eq('id', taskId)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}
```

## Step B3 — Komponen PhaseBoard

Buat `components/modules/projects/PhaseBoard.tsx`.

Tampilan yang diinginkan:
```
[+ Tambah Phase]

┌─ Phase SD (Schematic Design) ──────────── 1 Feb – 28 Feb ─┐
│ Status: Active                             [Edit] [Hapus]  │
│                                                            │
│  • Task: Denah lantai 1 (In Progress)                      │
│  • Task: Denah lantai 2 (To Do)                            │
│  • Task: Site plan (Done)                                  │
│                                           [+ Tambah Task]  │
└────────────────────────────────────────────────────────────┘

┌─ Phase DD (Design Development) ─────────── 1 Mar – 31 Mar ─┐
│ Status: Active                             [Edit] [Hapus]  │
│  (belum ada task)                                          │
│                                           [+ Tambah Task]  │
└─────────────────────────────────────────────────────────────┘

┌─ Unassigned Tasks ─────────────────────────────────────────┐
│  • Task: Review dokumen (To Do)                            │
└────────────────────────────────────────────────────────────┘
```

Props:
```ts
interface PhaseBoardProps {
  phases: ProjectPhase[]
  tasks: TaskWithRelations[]   // semua task dalam project ini
  projectId: string
  canManage: boolean           // true kalau user bisa edit (direktur, TD, manajer)
}
```

Catatan:
- Tambahkan tombol "+ Tambah Phase" yang buka dialog form (pakai komponen `Dialog` dari `@/components/ui/dialog`)
- Di form create phase: input name (required), description (optional), start_date (optional), end_date (optional)
- Task bisa di-drag dari satu phase ke phase lain menggunakan dnd-kit yang sudah ada
- Kalau tidak mau drag, cukup dropdown "Pindah ke phase" di setiap task

## Step B4 — Pasang di Project Detail

Buka `app/(protected)/projects/[id]/page.tsx`.

Tambahkan tab "Phases" di project detail. Fetch data:
```ts
const phases = await getProjectPhases(params.id)
```

Render `<PhaseBoard phases={phases} tasks={tasks} projectId={params.id} canManage={canManage} />`

---

# FITUR C — Hubungkan Notifikasi OS ↔ Docs

## Konteks

- OS sudah punya `NotificationsBell` di `components/layout/NotificationsBell.tsx` dengan Realtime hook
- Docs (app di port 3001) juga sudah punya notification system di schema `engdocs.notifications`
- Masalah: user harus buka dua app untuk cek semua notifikasi

## Pendekatan

Karena kedua app pakai Supabase yang sama, kita bisa query `engdocs.notifications` dari dalam OS.

## Step C1 — Update Hook useRealtimeNotifications

Buka `hooks/useRealtimeNotifications.ts`.

Tambahkan query ke `engdocs.notifications` di samping query ke `public.notifications`.

Catatan penting:
- Untuk query schema `engdocs` dari OS, gunakan supabase client dengan `.schema('engdocs')`
- Contoh: `supabase.schema('engdocs').from('notifications').select(...)`
- Pastikan tabel `engdocs.notifications` punya RLS yang membolehkan query dari OS

Gabungkan hasilnya, sort berdasarkan `created_at` descending, tampilkan di NotificationsBell yang sudah ada.

## Step C2 — Update NotificationsBell UI

Buka `components/layout/NotificationsBell.tsx`.

Tambahkan visual pembeda untuk notifikasi yang berasal dari Docs:
- Tambahkan label kecil "Docs" di sebelah notifikasi dari engdocs
- Warna badge berbeda (contoh: notifikasi OS = biru, notifikasi Docs = ungu)

## Step C3 — Update Mark as Read

Pastikan `markAllRead` juga mark semua notifikasi di `engdocs.notifications` sebagai read, tidak hanya `public.notifications`.

---

## Checklist Sebelum Selesai

### Fitur A — Gantt
- [ ] `npm install frappe-gantt` berhasil
- [ ] Gantt chart muncul di tab Timeline di halaman project
- [ ] Task yang punya due_date tampil sebagai bar
- [ ] Task tanpa due_date tidak error, muncul pesan info
- [ ] Bisa ganti view mode: Day / Week / Month
- [ ] Klik task di Gantt redirect ke `/tasks/[id]`

### Fitur B — Phase Planning
- [ ] Migration `project_phases` berhasil
- [ ] Bisa tambah phase baru di project
- [ ] Bisa edit nama/tanggal phase
- [ ] Bisa hapus phase (task tidak ikut terhapus, phase_id jadi null)
- [ ] Task tampil di dalam phase masing-masing
- [ ] Task yang belum punya phase tampil di bagian "Unassigned"

### Fitur C — Notifikasi Terhubung
- [ ] Notifikasi dari Docs muncul di bell OS
- [ ] Ada visual pembeda antara notif OS dan notif Docs
- [ ] Mark all read berlaku untuk kedua sumber
- [ ] Tidak ada error di console kalau engdocs tidak punya notifikasi
