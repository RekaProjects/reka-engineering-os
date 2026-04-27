# Phase 05 — Bug Fix & UX Fix

> Baca `BRIEFING.md` dulu sebelum mulai.
> Phase ini berisi perbaikan bug dan UX — bukan fitur baru.
> Kerjakan satu per satu secara berurutan.
> Estimasi: 1 minggu

---

## Daftar Fix

1. **[Fix A]** Google Drive folder tidak otomatis di-share ke member project
2. **[Fix B]** Dropdown assignee di task menampilkan semua user, bukan hanya member project
3. **[Fix C]** Add Member ke project tidak bisa spesifikasi discipline

---

# FIX A — Google Drive Folder Tidak Di-share ke Member

## Masalah

Sekarang ketika project dibuat dan Google Drive folder otomatis terbentuk, folder tersebut **hanya ada di Drive akun admin** yang setup OAuth. Member lain yang buka link folder mendapat **"Access Denied"** karena tidak pernah di-share.

File yang terlibat:
- `lib/files/drive-project-folder.ts` — fungsi `tryCreateProjectDriveFolderAfterInsert` yang buat folder tapi tidak share
- `lib/google/workspace-drive.ts` — Google Drive client
- `lib/projects/team-actions.ts` — `addTeamMember` yang tidak trigger share saat member baru ditambah

## Root Cause

Di `lib/files/drive-project-folder.ts` fungsi `tryCreateProjectDriveFolderAfterInsert`:
```ts
// Sekarang setelah folder dibuat, hanya update project di DB
// Tidak ada kode untuk share folder ke siapapun
const link = `https://drive.google.com/drive/folders/${projectFolderId}`
await supabase.from('projects').update({ ... }).eq('id', params.projectId)
// ← SELESAI. Tidak ada permissions.create dipanggil sama sekali.
```

## Solusi

Setelah folder dibuat, panggil Google Drive **Permissions API** untuk share folder ke semua member project.

### Step A1 — Tambah Helper Share Folder

Buka `lib/google/workspace-drive.ts`.

Tambahkan fungsi baru di bawah fungsi yang sudah ada:

```ts
/**
 * Share sebuah Drive folder ke email tertentu sebagai reader atau writer.
 * Gagal diam-diam (tidak throw) agar tidak block proses utama.
 */
export async function shareDriveFolderWithEmail(
  drive: drive_v3.Drive,
  folderId: string,
  email: string,
  role: 'reader' | 'writer' = 'writer',
): Promise<void> {
  try {
    await drive.permissions.create({
      fileId: folderId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      sendNotificationEmail: false, // Tidak perlu email notifikasi dari Google
    })
  } catch (err) {
    // Log tapi tidak throw — gagal share tidak boleh block create project
    console.error(`[Drive] Failed to share folder ${folderId} with ${email}:`, err)
  }
}

/**
 * Share folder ke banyak email sekaligus (parallel).
 */
export async function shareDriveFolderWithEmails(
  drive: drive_v3.Drive,
  folderId: string,
  emails: string[],
  role: 'reader' | 'writer' = 'writer',
): Promise<void> {
  if (emails.length === 0) return
  await Promise.allSettled(
    emails.map(email => shareDriveFolderWithEmail(drive, folderId, email, role))
  )
}
```

### Step A2 — Update tryCreateProjectDriveFolderAfterInsert

Buka `lib/files/drive-project-folder.ts`.

Fungsi `tryCreateProjectDriveFolderAfterInsert` menerima `params` — tambahkan `memberEmails` ke params dan panggil share setelah folder dibuat:

```ts
export async function tryCreateProjectDriveFolderAfterInsert(
  supabase: SupabaseClient,
  params: {
    projectId: string
    projectCode: string
    clientId: string
    sourceType: ProjectSourceType
    source: string
    disciplines: string[]
    driveMode: 'auto' | 'manual' | 'none'
    memberEmails?: string[]   // ← TAMBAHKAN INI
  },
): Promise<void> {
  if (params.driveMode !== 'auto') return
  if (params.disciplines.length === 0) return

  try {
    // ... kode yang sudah ada untuk buat folder ...
    const projectFolderId = await createProjectFolderHierarchy({ ... })
    if (!projectFolderId) return

    const link = `https://drive.google.com/drive/folders/${projectFolderId}`
    await supabase
      .from('projects')
      .update({
        google_drive_folder_id: projectFolderId,
        google_drive_folder_link: link,
      })
      .eq('id', params.projectId)

    // ← TAMBAHKAN INI: share ke semua member
    if (params.memberEmails && params.memberEmails.length > 0) {
      const ws = await getWorkspaceDrive(supabase)
      if (ws) {
        await shareDriveFolderWithEmails(ws.drive, projectFolderId, params.memberEmails)
      }
    }

  } catch (err) {
    console.error('[Google Drive] Failed to create folder hierarchy:', err)
  }
}
```

### Step A3 — Update Pemanggil di projects/actions.ts

Buka `lib/projects/actions.ts`.

Cari bagian yang memanggil `tryCreateProjectDriveFolderAfterInsert`. Tambahkan `memberEmails` yang diambil dari `project_team_assignments` setelah project dibuat:

```ts
// Setelah project berhasil di-insert dan team assignments dibuat:

// Ambil email semua member project ini
const { data: members } = await supabase
  .from('project_team_assignments')
  .select('profiles(email, google_email)')
  .eq('project_id', newProjectId)

const memberEmails = (members ?? [])
  .map((m: any) => m.profiles?.google_email || m.profiles?.email)
  .filter(Boolean) as string[]

// Pass ke folder creator
void tryCreateProjectDriveFolderAfterInsert(supabase, {
  projectId: newProjectId,
  // ... params lain yang sudah ada ...
  memberEmails,   // ← TAMBAHKAN INI
})
```

### Step A4 — Share ke Member Baru yang Ditambahkan Belakangan

Masalah lain: kalau project sudah punya Drive folder, lalu member baru ditambahkan — folder tidak otomatis di-share ke member baru itu.

Buka `lib/projects/team-actions.ts`, fungsi `addTeamMember`.

Setelah insert berhasil, tambahkan logic share:

```ts
export async function addTeamMember(formData: FormData) {
  // ... kode yang sudah ada ...

  const { error } = await supabase
    .from('project_team_assignments')
    .insert({ project_id: projectId, user_id: userId, team_role: teamRole })

  if (error) { ... }

  // ← TAMBAHKAN INI: share Drive folder ke member baru
  try {
    // Ambil Drive folder project (kalau ada)
    const { data: project } = await supabase
      .from('projects')
      .select('google_drive_folder_id')
      .eq('id', projectId)
      .single()

    if (project?.google_drive_folder_id) {
      // Ambil email member baru
      const { data: memberProfile } = await supabase
        .from('profiles')
        .select('email, google_email')
        .eq('id', userId)
        .single()

      const emailToShare = memberProfile?.google_email || memberProfile?.email
      if (emailToShare) {
        const ws = await getWorkspaceDrive(supabase)
        if (ws) {
          await shareDriveFolderWithEmail(ws.drive, project.google_drive_folder_id, emailToShare)
        }
      }
    }
  } catch (err) {
    // Jangan block response kalau share gagal
    console.error('[Drive] Failed to share folder to new member:', err)
  }

  revalidatePath(`/projects/${projectId}`)
  return { success: true }
}
```

### Step A5 — Tambah Kolom google_email di Profiles (Opsional tapi Disarankan)

Beberapa member mungkin pakai email berbeda untuk Reka OS dan Google Drive mereka.

Buat migration `0041_profiles_google_email.sql`:

```sql
-- Tambah kolom google_email opsional di profiles
-- Dipakai untuk share Google Drive folder ke email Google yang benar
-- kalau berbeda dengan email login Reka OS

alter table public.profiles
  add column if not exists google_email text;

comment on column public.profiles.google_email is
  'Email Google Drive (kalau berbeda dengan email login). Dipakai untuk auto-share folder project.';
```

Tambahkan field "Google Email" di halaman `My Profile` (`app/(protected)/my-profile/page.tsx`):
- Label: "Google Email (untuk Drive)"
- Placeholder: "Kosongkan kalau sama dengan email login"
- Hint kecil: "Diisi kalau email Google Drive kamu berbeda dengan email login Reka OS"

---

# FIX B — Task Assignee Harus Filter by Project Member

## Masalah

Sekarang di form buat/edit task (`components/modules/tasks/TaskForm.tsx`), dropdown **Assigned To** dan **Reviewer** menampilkan **semua user di seluruh sistem** — termasuk orang yang sama sekali tidak ada di project tersebut.

Akibatnya:
- Bisa assign task ke orang yang bukan anggota project
- Dropdown panjang dan membingungkan
- Tidak ada validasi bahwa assignee harus bagian dari team project

## Root Cause

Di halaman task (`app/(protected)/tasks/new/page.tsx` dan `tasks/[id]/edit/page.tsx`), variabel `users` yang dikirim ke `TaskForm` diambil dari `getUsersForSelect()` — yang mengambil **semua user aktif** tanpa filter project.

## Solusi

### Step B1 — Tambah Query getProjectMemberUsers

Buka `lib/users/queries.ts`.

Tambahkan fungsi baru:

```ts
/**
 * Ambil users yang merupakan member dari project tertentu.
 * Dipakai untuk dropdown assignee di task form.
 */
export async function getProjectMemberUsers(projectId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from('project_team_assignments')
    .select(`
      user_id,
      team_role,
      profiles!user_id (
        id,
        full_name,
        email,
        discipline
      )
    `)
    .eq('project_id', projectId)

  if (error) return []

  return (data ?? []).map((row: any) => ({
    id: row.profiles.id,
    full_name: row.profiles.full_name,
    email: row.profiles.email,
    discipline: row.profiles.discipline,
    team_role: row.team_role,
  }))
}
```

### Step B2 — Update Halaman Task New

Buka `app/(protected)/tasks/new/page.tsx`.

Sekarang halaman ini fetch semua users. Ubah logikanya:

```ts
// Sebelum (fetch semua users):
const users = await getUsersForSelect()

// Sesudah (kalau ada project_id dari query param, fetch member project):
const projectId = searchParams?.project_id as string | undefined

const users = projectId
  ? await getProjectMemberUsers(projectId)
  : await getUsersForSelect()  // fallback kalau buka dari /tasks/new tanpa context project
```

### Step B3 — Update Halaman Task Edit

Buka `app/(protected)/tasks/[id]/edit/page.tsx`.

Task edit sudah tahu `project_id` dari data task. Gunakan itu:

```ts
// Ambil task dulu (sudah ada)
const task = await getTaskById(params.id)

// Fetch member project, bukan semua users
const users = task?.project_id
  ? await getProjectMemberUsers(task.project_id)
  : await getUsersForSelect()
```

### Step B4 — Update TaskForm untuk Tampilkan Info Role

Buka `components/modules/tasks/TaskForm.tsx`.

Sekarang dropdown assignee cuma tampilkan `full_name (email)`. Update supaya tampilkan team role juga supaya PM tahu siapa Lead, Engineer, dll:

```tsx
// Sebelum:
<option key={u.id} value={u.id}>
  {u.full_name} ({u.email})
</option>

// Sesudah:
<option key={u.id} value={u.id}>
  {u.full_name}
  {(u as any).team_role ? ` — ${(u as any).team_role}` : ''}
</option>
```

Contoh hasilnya di dropdown:
```
Budi Santoso — lead
Ani Rahayu — engineer
Citra Dewi — drafter
```

### Step B5 — Validasi di Server Action

Buka `lib/tasks/actions.ts`, fungsi `createTask` dan `updateTask`.

Tambahkan validasi: assignee harus member dari project tersebut.

```ts
// Di createTask, setelah dapat project_id dan assigned_to_user_id:
if (projectId && assignedToUserId) {
  const { data: membership } = await supabase
    .from('project_team_assignments')
    .select('id')
    .eq('project_id', projectId)
    .eq('user_id', assignedToUserId)
    .single()

  if (!membership) {
    return { error: 'Assignee harus merupakan anggota project ini.' }
  }
}
```

---

# FIX C — Add Member Perlu Kolom Discipline

## Masalah

Satu project bisa punya beberapa disiplin (contoh: MEP + Structural). Ketika tambah member, tidak bisa spesifikasi member itu handle disiplin apa dalam project tersebut.

Akibatnya tidak jelas:
```
Project: Gedung ABC (MEP, Structural)
Team:
  - Budi → Lead         ← Lead untuk MEP? Structural? Dua-duanya?
  - Ani  → Engineer     ← Engineer untuk apa?
```

Yang diinginkan:
```
Project: Gedung ABC (MEP, Structural)
Team:
  - Budi → Lead      → MEP
  - Ani  → Engineer  → Structural
  - Citra → Drafter  → MEP, Structural
```

## Root Cause

Tabel `project_team_assignments` tidak punya kolom `discipline`. Hanya ada `team_role`.

## Solusi

### Step C1 — Database Migration

Buat `supabase/migrations/0042_team_assignment_discipline.sql`:

```sql
-- =============================================================
-- Tambah kolom discipline ke project_team_assignments
-- Opsional: null berarti handle semua disiplin dalam project
-- =============================================================

alter table public.project_team_assignments
  add column if not exists discipline text;

comment on column public.project_team_assignments.discipline is
  'Disiplin yang ditangani member ini dalam project (mechanical, civil, dll).
   NULL berarti tidak spesifik / handle semua disiplin project.';

-- Tidak ada constraint check di sini karena nilai discipline
-- bisa berubah sesuai setting_options, bukan enum tetap.
```

### Step C2 — Update team-queries.ts

Buka `lib/projects/team-queries.ts`.

Update type `TeamMemberWithProfile` untuk include `discipline`:

```ts
export interface TeamMemberWithProfile {
  id: string
  project_id: string
  user_id: string
  team_role: string
  discipline: string | null   // ← TAMBAHKAN INI
  assigned_at: string
  profiles: {
    id: string
    full_name: string
    email: string
    discipline: string | null
  }
}
```

Update query di `getTeamByProjectId`:

```ts
const { data, error } = await supabase
  .from('project_team_assignments')
  .select('*, profiles(id, full_name, email, discipline)')  // sudah benar
  .eq('project_id', projectId)
  .order('assigned_at', { ascending: true })
```

Kolom `discipline` di `project_team_assignments` sudah ikut karena `*`.

### Step C3 — Update team-actions.ts

Buka `lib/projects/team-actions.ts`, fungsi `addTeamMember`.

Tambahkan pengambilan `discipline` dari form:

```ts
export async function addTeamMember(formData: FormData) {
  // ... kode yang sudah ada ...

  const projectId  = (formData.get('project_id') as string)?.trim()
  const userId     = (formData.get('user_id') as string)?.trim()
  const teamRole   = (formData.get('team_role') as string)?.trim() || 'engineer'
  const discipline = (formData.get('discipline') as string)?.trim() || null  // ← TAMBAHKAN

  // ...

  const { error } = await supabase
    .from('project_team_assignments')
    .insert({
      project_id: projectId,
      user_id: userId,
      team_role: teamRole,
      discipline,    // ← TAMBAHKAN
    })

  // ...
}
```

### Step C4 — Update AddTeamMemberForm

Buka `components/modules/projects/AddTeamMemberForm.tsx`.

Tambahkan props `projectDisciplines` dan dropdown discipline baru:

```tsx
interface AddTeamMemberFormProps {
  projectId: string
  users: { id: string; full_name: string; email: string; discipline: string | null }[]
  assignedUserIds: string[]
  projectDisciplines: string[]  // ← TAMBAHKAN: list disiplin yang ada di project ini
}

export function AddTeamMemberForm({
  projectId,
  users,
  assignedUserIds,
  projectDisciplines,
}: AddTeamMemberFormProps) {
```

Tambahkan dropdown discipline di dalam form, setelah dropdown team_role:

```tsx
{/* Tambahkan setelah dropdown team_role */}
<div style={{ flex: '0 0 160px' }}>
  <label style={labelStyle}>Discipline</label>
  <select name="discipline" style={{ ...inputStyle, width: '100%' }}>
    <option value="">Semua disiplin</option>
    {projectDisciplines.map((d) => (
      <option key={d} value={d}>
        {d.charAt(0).toUpperCase() + d.slice(1)}
      </option>
    ))}
  </select>
</div>
```

### Step C5 — Update Halaman Project Detail

Buka `app/(protected)/projects/[id]/page.tsx`.

Pass `projectDisciplines` ke `AddTeamMemberForm`:

```tsx
// project.disciplines sudah ada dari getProjectById
const projectDisciplines = normalizeProjectDisciplines(project) // sudah ada helper ini

// Di JSX:
<AddTeamMemberForm
  projectId={project.id}
  users={users}
  assignedUserIds={team.map(m => m.user_id)}
  projectDisciplines={projectDisciplines}   // ← TAMBAHKAN
/>
```

### Step C6 — Update TeamMemberList untuk Tampilkan Discipline

Buka `components/modules/projects/TeamMemberList.tsx`.

Tambahkan kolom/label discipline di list member yang sudah tampil:

```tsx
// Di setiap baris member, tambahkan badge discipline:
{member.discipline && (
  <span style={{
    fontSize: '0.6875rem',
    padding: '1px 7px',
    borderRadius: '10px',
    background: 'var(--color-surface-muted)',
    color: 'var(--color-text-muted)',
    border: '1px solid var(--color-border)',
  }}>
    {member.discipline}
  </span>
)}
```

---

## Checklist Sebelum Selesai

### Fix A — Google Drive Sharing
- [ ] Fungsi `shareDriveFolderWithEmail` ada di `workspace-drive.ts`
- [ ] Saat project dibuat + Drive mode auto → folder dibuat → otomatis di-share ke semua member
- [ ] Saat member baru ditambahkan ke project yang sudah punya Drive folder → otomatis di-share
- [ ] Kalau share gagal → tidak error, cukup log di console
- [ ] Kolom `google_email` ada di tabel `profiles`
- [ ] Field "Google Email" tampil di halaman My Profile
- [ ] Logika email: pakai `google_email` kalau ada, fallback ke `email`

### Fix B — Task Assignee Filter
- [ ] Fungsi `getProjectMemberUsers` ada di `lib/users/queries.ts`
- [ ] Halaman task/new: dropdown assignee hanya tampilkan member project (kalau ada project_id)
- [ ] Halaman task/edit: dropdown assignee hanya tampilkan member project tersebut
- [ ] Dropdown tampilkan nama + team_role (contoh: "Budi — lead")
- [ ] Server action validasi: assignee harus member project
- [ ] Error message jelas kalau validasi gagal

### Fix C — Add Member + Discipline
- [ ] Migration `0042_team_assignment_discipline.sql` berhasil dijalankan
- [ ] Kolom `discipline` ada di tabel `project_team_assignments`
- [ ] Form Add Member punya dropdown discipline (isinya sesuai disciplines project)
- [ ] Pilihan "Semua disiplin" tersedia sebagai default (value kosong)
- [ ] Data discipline tersimpan saat add member
- [ ] TeamMemberList menampilkan badge discipline per member
- [ ] Member tanpa discipline tidak error (tampil tanpa badge)
