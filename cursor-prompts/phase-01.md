# Phase 01 — Comment & Thread System

> Baca `BRIEFING.md` dulu sebelum mulai.
> Estimasi: 3–5 hari kerja

---

## Konteks

Sekarang tidak ada cara untuk berdiskusi langsung di dalam task atau deliverable. Tim harus kirim WhatsApp atau email kalau mau kasih feedback. Kita perlu bangun sistem komentar yang tertempel langsung di dalam task dan deliverable.

**Catatan penting sebelum mulai:**
- Kanban board sudah ada di `components/modules/tasks/TasksKanban.tsx` — JANGAN disentuh
- Notification bell sudah ada di `components/layout/NotificationsBell.tsx` — JANGAN disentuh
- Kita hanya perlu membangun **comment system** di phase ini

---

## Tujuan Akhir

User bisa:
1. Tulis komentar di halaman detail Task (`/tasks/[id]`)
2. Tulis komentar di halaman detail Deliverable (`/deliverables/[id]`)
3. Reply ke komentar yang ada (1 level nesting saja, tidak perlu unlimited nesting)
4. Edit komentar milik sendiri
5. Hapus komentar milik sendiri
6. Semua member yang di-assign ke project terkait bisa lihat komentar

---

## Step 1 — Database Migration

Buat file `supabase/migrations/XXXX_comments.sql` (ganti XXXX dengan nomor setelah migration terakhir).

```sql
-- ============================================================
-- COMMENTS TABLE
-- Dipakai untuk task comments dan deliverable comments
-- ============================================================

create table if not exists public.comments (
  id              uuid primary key default gen_random_uuid(),
  
  -- Target: salah satu harus diisi, yang lain null
  task_id         uuid references public.tasks(id) on delete cascade,
  deliverable_id  uuid references public.deliverables(id) on delete cascade,
  
  -- Reply: kalau ini reply, isi parent_id dengan id komentar induk
  parent_id       uuid references public.comments(id) on delete cascade,
  
  author_id       uuid not null references public.profiles(id) on delete cascade,
  body            text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  
  edited_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Constraint: harus ada task_id ATAU deliverable_id, tidak boleh dua-duanya
alter table public.comments
  add constraint comments_target_check
  check (
    (task_id is not null and deliverable_id is null) or
    (task_id is null and deliverable_id is not null)
  );

-- Index untuk query per task / per deliverable
create index comments_task_id_idx on public.comments(task_id) where task_id is not null;
create index comments_deliverable_id_idx on public.comments(deliverable_id) where deliverable_id is not null;
create index comments_parent_id_idx on public.comments(parent_id) where parent_id is not null;
create index comments_author_id_idx on public.comments(author_id);
create index comments_created_at_idx on public.comments(created_at desc);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger (skip kalau fungsinya sudah ada)
create trigger comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.comments enable row level security;

-- Baca: semua user yang sudah login bisa baca
create policy "comments_select"
  on public.comments for select
  to authenticated
  using (true);

-- Insert: user yang login bisa tambah komentar
create policy "comments_insert"
  on public.comments for insert
  to authenticated
  with check (auth.uid() = author_id);

-- Update: hanya author yang bisa edit, dan hanya kolom body
create policy "comments_update"
  on public.comments for update
  to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Delete: author bisa hapus komentar sendiri, admin bisa hapus semua
create policy "comments_delete"
  on public.comments for delete
  to authenticated
  using (
    auth.uid() = author_id
    or exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role in ('direktur', 'technical_director')
    )
  );
```

Jalankan migration:
```bash
npx supabase db push
# atau kalau pakai local:
npx supabase migration up
```

---

## Step 2 — Query Functions

Buat file `lib/comments/queries.ts`:

```ts
import { createServerClient } from '@/lib/supabase/server'

export type CommentWithAuthor = {
  id: string
  body: string
  parent_id: string | null
  author_id: string
  edited_at: string | null
  created_at: string
  author: {
    id: string
    full_name: string
    avatar_url: string | null
  }
  replies?: CommentWithAuthor[]
}

/**
 * Ambil semua komentar untuk sebuah task.
 * Hasilnya sudah disusun: top-level dulu, lalu replies di-nest di bawah parent.
 */
export async function getTaskComments(taskId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, body, parent_id, author_id, edited_at, created_at,
      author:profiles!author_id(id, full_name, avatar_url)
    `)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return nestComments(data ?? [])
}

/**
 * Ambil semua komentar untuk sebuah deliverable.
 */
export async function getDeliverableComments(deliverableId: string): Promise<CommentWithAuthor[]> {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('comments')
    .select(`
      id, body, parent_id, author_id, edited_at, created_at,
      author:profiles!author_id(id, full_name, avatar_url)
    `)
    .eq('deliverable_id', deliverableId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return nestComments(data ?? [])
}

/** Helper: susun flat list jadi nested (parent → replies) */
function nestComments(flat: CommentWithAuthor[]): CommentWithAuthor[] {
  const map = new Map<string, CommentWithAuthor>()
  const roots: CommentWithAuthor[] = []

  for (const c of flat) {
    map.set(c.id, { ...c, replies: [] })
  }
  for (const c of map.values()) {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(c)
    } else {
      roots.push(c)
    }
  }
  return roots
}
```

---

## Step 3 — Server Actions

Buat file `lib/comments/actions.ts`:

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

// ── ADD COMMENT ──────────────────────────────────────────────
export async function addComment(input: {
  body: string
  taskId?: string
  deliverableId?: string
  parentId?: string
}) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { body, taskId, deliverableId, parentId } = input

  if (!body.trim()) return { error: 'Komentar tidak boleh kosong' }
  if (body.length > 2000) return { error: 'Komentar terlalu panjang (maks 2000 karakter)' }
  if (!taskId && !deliverableId) return { error: 'Target tidak valid' }

  const { error } = await supabase.from('comments').insert({
    body: body.trim(),
    task_id: taskId ?? null,
    deliverable_id: deliverableId ?? null,
    parent_id: parentId ?? null,
    author_id: user.id,
  })

  if (error) return { error: error.message }

  if (taskId) revalidatePath(`/tasks/${taskId}`)
  if (deliverableId) revalidatePath(`/deliverables/${deliverableId}`)
  return { ok: true }
}

// ── EDIT COMMENT ─────────────────────────────────────────────
export async function editComment(id: string, body: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (!body.trim()) return { error: 'Komentar tidak boleh kosong' }

  const { error } = await supabase
    .from('comments')
    .update({ body: body.trim(), edited_at: new Date().toISOString() })
    .eq('id', id)
    .eq('author_id', user.id) // RLS backup

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}

// ── DELETE COMMENT ────────────────────────────────────────────
export async function deleteComment(id: string) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return { ok: true }
}
```

---

## Step 4 — Komponen CommentSection

Buat file `components/modules/comments/CommentSection.tsx`.

Komponen ini adalah **Client Component** karena butuh state untuk form input dan optimistic update.

Isi dan behavior yang dibutuhkan:

```
CommentSection
├── Daftar komentar (loop CommentItem)
│   └── CommentItem
│       ├── Avatar + nama author + waktu
│       ├── Body teks
│       ├── Badge "edited" kalau edited_at ada
│       ├── Tombol "Reply" (muncul hover)
│       ├── Tombol "Edit" (hanya untuk author sendiri, muncul hover)
│       ├── Tombol "Hapus" (hanya untuk author sendiri, muncul hover)
│       └── Replies (nested, 1 level)
│           └── CommentItem (sama, tapi tanpa tombol Reply lagi)
└── CommentForm (input baru)
    ├── Textarea (placeholder: "Tulis komentar...")
    └── Tombol Kirim
```

Props untuk CommentSection:
```ts
interface CommentSectionProps {
  comments: CommentWithAuthor[]        // dari getTaskComments atau getDeliverableComments
  taskId?: string
  deliverableId?: string
  currentUserId: string
}
```

Aturan styling:
- Pakai CSS variables (lihat BRIEFING.md)
- Avatar: tampilkan inisial kalau `avatar_url` null (background warna dari nama)
- Timestamp: tampilkan relatif ("2 jam lalu", "kemarin") pakai `formatRelativeTime` dari `lib/utils/formatters.ts` kalau ada, atau buat sederhana dengan `Intl.RelativeTimeFormat`
- Edit mode: textarea inline, bukan dialog/modal
- Konfirmasi hapus: pakai `window.confirm` sederhana, cukup

---

## Step 5 — Pasang di Halaman Task

Buka `app/(protected)/tasks/[id]/page.tsx`.

1. Import `getTaskComments` dari `lib/comments/queries`
2. Panggil `getTaskComments(params.id)` di server component
3. Tambahkan section `<CommentSection>` di bawah konten task yang ada
4. Pastikan pass `currentUserId` dari session

Contoh pola yang sudah ada di file lain:
```ts
// Ambil data
const comments = await getTaskComments(params.id)

// Di JSX, tambahkan di bawah konten task:
<CommentSection
  comments={comments}
  taskId={params.id}
  currentUserId={user.id}
/>
```

---

## Step 6 — Pasang di Halaman Deliverable

Buka `app/(protected)/deliverables/[id]/page.tsx`.

Sama persis dengan Step 5, tapi pakai `getDeliverableComments` dan pass `deliverableId`.

---

## Step 7 — Update Supabase Types (Optional tapi Disarankan)

Kalau project pakai generated types:
```bash
npx supabase gen types typescript --local > types/supabase.ts
```

---

## Checklist Sebelum Selesai

- [ ] Migration sudah dijalankan dan tabel `comments` ada di Supabase
- [ ] Bisa tambah komentar di task
- [ ] Bisa tambah komentar di deliverable  
- [ ] Bisa reply ke komentar (1 level)
- [ ] Bisa edit komentar sendiri
- [ ] Bisa hapus komentar sendiri
- [ ] Komentar orang lain tidak bisa di-edit/hapus
- [ ] UI konsisten dengan halaman lain (warna, font, spacing)
- [ ] Tidak ada error di console browser

---

## Yang TIDAK Perlu Dibangun di Phase Ini

- Mention user (`@nama`) — simpan untuk nanti
- Emoji reaction — tidak perlu
- Rich text / markdown di komentar — plain text saja
- Notifikasi kalau ada komentar baru — simpan untuk phase berikutnya
- Komentar di halaman selain task dan deliverable — cukup 2 ini dulu
