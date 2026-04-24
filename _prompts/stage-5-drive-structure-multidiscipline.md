# Stage 5 — Google Drive Folder Structure + Multi-Discipline

## Context

Next.js 15 App Router, TypeScript strict, Supabase, React 19. Project ini adalah Reka Engineering OS.

File-file yang relevan — **baca semua sebelum mulai coding**:
- `components/modules/projects/ProjectForm.tsx` — form buat/edit project
- `lib/google/workspace-drive.ts` — fungsi buat folder Drive
- `lib/files/drive-project-folder.ts` — orchestrator folder creation
- `lib/files/drive-service.ts` — naming helper
- `app/(protected)/settings/page.tsx` — halaman settings
- `lib/settings/` — cek cara penyimpanan config yang sudah ada
- `types/database.ts` — TypeScript types
- `supabase/migrations/` — lihat migration terakhir untuk tahu nomor urut berikutnya

---

## Latar Belakang

Saat ini:
- Field `discipline` di project adalah **single text** — hanya bisa pilih satu disiplin
- Google Drive hanya membuat **satu folder project** langsung di root My Drive tanpa struktur
- Form project masih ada input manual "Google Drive Folder Link" yang membingungkan

Yang diinginkan:
- `discipline` berubah jadi **multi-select** — project bisa punya lebih dari satu disiplin
- Drive folder punya **struktur hierarki lengkap** sesuai sumber dan disiplin project
- Form project punya **pilihan mode Drive** yang jelas (otomatis / manual / skip)
- Ada tombol **on-demand** untuk tambah subfolder Fase 6 (Construction Admin) dari halaman detail project

---

## Perubahan 1 — Database Migration

Buat file: `supabase/migrations/0035_discipline_array_and_drive_mode.sql`

```sql
-- 1. Tambah kolom disciplines sebagai array (pengganti discipline)
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS disciplines text[] NOT NULL DEFAULT '{}';

-- 2. Migrate data lama: salin nilai discipline ke disciplines
UPDATE public.projects
SET disciplines = ARRAY[discipline]
WHERE discipline IS NOT NULL AND discipline != '' AND disciplines = '{}';

-- 3. Tambah kolom drive_mode
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS drive_mode text
  CHECK (drive_mode IN ('auto', 'manual', 'none'))
  DEFAULT 'auto';

-- Jangan drop kolom discipline — biarkan sebagai deprecated, hapus di migration berikutnya
```

**Setelah file dibuat, jalankan SQL ini di Supabase SQL Editor sebelum lanjut coding.**

---

## Perubahan 2 — TypeScript Types

Di `types/database.ts`, update interface `Project` (atau tipe yang setara):

```ts
// Tambah field baru:
disciplines: string[]
drive_mode: 'auto' | 'manual' | 'none' | null

// Field lama ini tetap ada (deprecated tapi belum dihapus):
// discipline: string | null
```

Pastikan `google_drive_folder_id: string | null` dan `google_drive_folder_link: string | null` sudah ada. Kalau belum, tambahkan.

---

## Perubahan 3 — Settings: Konfigurasi Root Folder Drive

Di `app/(protected)/settings/page.tsx`, pada tab Finance, tambahkan form untuk mengisi nama root folder Drive.

**Langkah:**
1. Cek `lib/settings/` — gunakan cara penyimpanan config yang sudah ada di project (kemungkinan pakai `setting_options` table atau config table sendiri)
2. Simpan config dengan key `drive_root_folder_name`, value default `Projects`
3. Buat helper function di `lib/settings/queries.ts` (atau file yang relevan):

```ts
export async function getDriveRootFolderName(): Promise<string> {
  // Ambil dari config/settings table
  // Return 'Projects' sebagai default kalau belum di-set
}

export async function setDriveRootFolderName(name: string): Promise<void> {
  // Simpan ke config/settings table
}
```

**UI di Settings → Finance tab** (tambahkan di atas link FX Rates):

```
──────────────────────────────────────
Google Drive — Root Folder
──────────────────────────────────────
Nama folder induk di My Drive tempat semua folder project disimpan.

Root folder name: [Projects          ]
                  Dibuat otomatis jika belum ada.
[Save]
```

Tambahkan server action `saveDriveRootFolderName(formData)` untuk handle submit.

---

## Perubahan 4 — ProjectForm: Discipline jadi Multi-Select

Di `components/modules/projects/ProjectForm.tsx`:

### Ganti field discipline (single) → disciplines (multi-select checkbox dropdown)

Cek dulu apakah ada komponen `MultiSelect` atau checkbox dropdown di `components/ui/`. Kalau ada, gunakan. Kalau tidak ada, buat komponen baru `components/ui/MultiSelectDropdown.tsx`:

```tsx
'use client'

interface MultiSelectDropdownProps {
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

export function MultiSelectDropdown({ options, selected, onChange, placeholder }: MultiSelectDropdownProps) {
  // Dropdown yang ketika diklik menampilkan list checkbox
  // Selected items ditampilkan sebagai badge/tag di dalam field
  // Contoh tampilan field: [Mechanical ×] [Civil ×] ▼
}
```

### Opsi disiplin

Ambil dari `setting_options` domain `discipline` (yang sudah ada di database). Kalau kosong, fallback ke hardcode:
```ts
const DEFAULT_DISCIPLINES = [
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Civil', label: 'Civil' },
  { value: 'Structural', label: 'Structural' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Other', label: 'Other' },
]
```

### Validasi

Minimal 1 disiplin harus dipilih (required). Tampilkan error kalau kosong saat submit.

### Submit

Kirim `disciplines: string[]` ke server action, bukan `discipline: string`.

---

## Perubahan 5 — ProjectForm: Opsi Mode Drive

Di `components/modules/projects/ProjectForm.tsx`, hapus field text "Google Drive Folder Link" dari form **New Project**.

Ganti dengan pilihan radio untuk `drive_mode`:

```tsx
{/* Bagian Links & notes — ganti konten dengan ini: */}
<fieldset>
  <legend>Penyimpanan Google Drive</legend>

  {driveConnected ? (
    <>
      <label>
        <input type="radio" name="drive_mode" value="auto" defaultChecked />
        Buat folder otomatis
        <span>Folder dibuat di Drive organisasi sesuai struktur project.</span>
      </label>
      <label>
        <input type="radio" name="drive_mode" value="manual" />
        Pakai link sendiri
      </label>
      <label>
        <input type="radio" name="drive_mode" value="none" />
        Tidak pakai Drive
      </label>
    </>
  ) : (
    <>
      <p>⚠️ Google Drive belum terhubung.
        <a href="/settings?tab=finance">Hubungkan di Settings</a>, 
        atau pilih "Pakai link sendiri".
      </p>
      <label>
        <input type="radio" name="drive_mode" value="manual" defaultChecked />
        Pakai link sendiri
      </label>
      <label>
        <input type="radio" name="drive_mode" value="none" />
        Tidak pakai Drive
      </label>
    </>
  )}

  {/* Input URL muncul hanya kalau pilih "manual" */}
  {driveMode === 'manual' && (
    <input
      name="google_drive_folder_link"
      type="url"
      placeholder="https://drive.google.com/drive/folders/..."
    />
  )}
</fieldset>
```

Untuk cek `driveConnected`, fetch dari server: query `google_workspace_tokens` where `id = 'default'`, return boolean. Bisa dilakukan di server component parent atau lewat server action.

Untuk form edit project yang sudah ada: tetap tampilkan link Drive yang sudah tersimpan sebagai read-only, dengan tombol "Buka di Drive" kalau ada.

---

## Perubahan 6 — Drive Folder Creation: Struktur Hierarki

Update `lib/google/workspace-drive.ts` dan `lib/files/drive-project-folder.ts`.

### Struktur folder yang dibuat

```
[Root Folder]/                              ← dari Settings (default: "Projects")
└── [Domestic | Platform]/                  ← dari source_type project
    └── [Direct | Fiverr | Upwork | ...]/   ← dari field source project
        └── REKA-[CLIENT]-[CODE]-[YEAR]/    ← folder project (nama dari buildRekaDriveFolderName)
            ├── [Discipline 1]/             ← satu folder per disiplin
            │   ├── 01-Inisiasi/
            │   ├── 02-Konsep/
            │   ├── 03-Design-Development/
            │   ├── 04-Construction-Document/
            │   └── 05-Rendering/
            └── [Discipline 2]/             ← kalau ada disiplin kedua
                ├── 01-Inisiasi/
                └── ...
```

### Helper: cari atau buat folder

Tambahkan helper function di `lib/google/workspace-drive.ts`:

```ts
/**
 * Cari folder berdasarkan nama di dalam parent.
 * Kalau belum ada, buat baru. Return folder ID.
 */
async function findOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId: string | null,
): Promise<string> {
  // 1. Query dulu: name='...' and 'parentId' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false
  // 2. Kalau ketemu → return id yang ada (cegah duplikasi)
  // 3. Kalau tidak ada → buat baru dengan parents: [parentId]
  const query = parentId
    ? `name = '${name}' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    : `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`

  const res = await drive.files.list({
    q: query,
    fields: 'files(id)',
    pageSize: 1,
  })

  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id!
  }

  const created = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      ...(parentId ? { parents: [parentId] } : {}),
    },
    fields: 'id',
  })

  return created.data.id!
}
```

### Update fungsi utama

Update `tryCreateProjectDriveFolderAfterInsert` di `lib/files/drive-project-folder.ts`:

```ts
export async function tryCreateProjectDriveFolderAfterInsert(
  supabase: SupabaseClient,
  params: {
    projectId: string
    projectCode: string
    clientId: string
    sourceType: 'DOMESTIC' | 'PLATFORM'
    source: string           // 'Direct', 'Fiverr', 'Upwork', 'Referral', 'Other'
    disciplines: string[]    // ['Mechanical', 'Civil']
  },
): Promise<void> {
  try {
    // 1. Ambil root folder name dari settings
    const rootFolderName = await getDriveRootFolderName() // default 'Projects'

    // 2. Ambil client code
    const { data: client } = await supabase
      .from('clients').select('client_code').eq('id', params.clientId).maybeSingle()
    const clientCode = (client?.client_code as string | undefined)?.trim() || 'CLIENT'

    // 3. Build nama folder project
    const projectFolderName = buildRekaDriveFolderName({
      clientCode,
      projectCode: params.projectCode || 'PROJ',
    })

    // 4. Buat hierarki folder
    const projectFolderId = await createProjectFolderHierarchy({
      rootFolderName,
      sourceType: params.sourceType,   // 'DOMESTIC' atau 'PLATFORM'
      source: params.source,           // 'Direct', 'Fiverr', dll
      projectFolderName,
      disciplines: params.disciplines,
      supabase,
    })

    if (!projectFolderId) return

    // 5. Simpan ke project record
    const link = `https://drive.google.com/drive/folders/${projectFolderId}`
    await supabase
      .from('projects')
      .update({
        google_drive_folder_id: projectFolderId,
        google_drive_folder_link: link,
      })
      .eq('id', params.projectId)

  } catch (err) {
    console.error('[Google Drive] Failed to create folder hierarchy:', err)
  }
}
```

Buat fungsi `createProjectFolderHierarchy` yang memanggil `findOrCreateFolder` secara berurutan untuk tiap level hierarki. Fase subfolders yang dibuat per disiplin: `['01-Inisiasi', '02-Konsep', '03-Design-Development', '04-Construction-Document', '05-Rendering']`.

### Update pemanggil

Cari di mana `tryCreateProjectDriveFolderAfterInsert` dipanggil (kemungkinan di server action create project). Update pemanggilan untuk pass `sourceType`, `source`, dan `disciplines`.

---

## Perubahan 7 — Project Detail: Tombol Tambah Construction Admin

Di halaman detail project (cari file yang render halaman `/projects/[id]`):

Tambahkan tombol **"+ Tambah Fase Construction Admin"** dengan kondisi:
- `project.drive_mode === 'auto'`
- `project.google_drive_folder_id !== null`
- User adalah TD, atau Manajer yang menjadi project lead
- Belum pernah dibuat (bisa dicek dengan query ke Drive atau simpan flag `drive_construction_admin_created: boolean` di project record)

**Server action `addConstructionAdminFolders`:**

```ts
'use server'
async function addConstructionAdminFolders(projectId: string) {
  // 1. Ambil project: google_drive_folder_id, disciplines
  // 2. Init Drive client dengan token dari google_workspace_tokens
  // 3. Untuk setiap disiplin:
  //    a. Cari folder disiplin di dalam google_drive_folder_id
  //    b. Buat subfolder '06-Construction-Admin' di dalamnya (pakai findOrCreateFolder)
  // 4. Update project: drive_construction_admin_created = true
  // 5. revalidatePath('/projects/' + projectId)
}
```

Kalau belum ada kolom `drive_construction_admin_created` di database, tambahkan di migration yang sama atau buat migration baru `0036_drive_construction_admin_flag.sql`:
```sql
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS drive_construction_admin_created boolean NOT NULL DEFAULT false;
```

**UI tombolnya:**
```tsx
{canAddConstructionAdmin && (
  <form action={addConstructionAdminFolders.bind(null, project.id)}>
    <button type="submit">
      + Tambah Fase Construction Admin di Drive
    </button>
  </form>
)}

{project.drive_construction_admin_created && (
  <span>✓ Fase Construction Admin sudah ditambahkan</span>
)}
```

---

## Perubahan 8 — Project List & Cards

Cari semua tempat yang menggunakan field `discipline` (grep: `project.discipline`, `\.discipline`). Update untuk handle `disciplines` array:

- **Badge disiplin**: tampilkan semua disiplin sebagai multiple badge, bukan satu teks
- **Filter dropdown**: kalau ada filter "by discipline", ubah dari exact match ke array contains (`@>`)
- **Project card**: tampilkan badge per disiplin

Contoh tampilan badge:
```tsx
{project.disciplines.map(d => (
  <span key={d} className="badge">{d}</span>
))}
```

---

## Urutan Pengerjaan

1. **Jalankan migration SQL** di Supabase SQL Editor (langkah manual)
2. Update `types/database.ts`
3. Buat/update `getDriveRootFolderName()` dan Settings UI
4. Buat `MultiSelectDropdown` component
5. Update `ProjectForm` — discipline multi-select
6. Update `ProjectForm` — drive mode radio
7. Update `lib/google/workspace-drive.ts` — tambah `findOrCreateFolder`
8. Update `lib/files/drive-project-folder.ts` — hierarki lengkap
9. Update server action create project untuk pass params baru
10. Tambah tombol Construction Admin di detail project
11. Update project list/card untuk multi-discipline
12. `npx tsc --noEmit` — harus zero errors

---

## Yang Tidak Boleh Diubah

- Jangan ubah OAuth routes (`start/route.ts`, `callback/route.ts`)
- Jangan ubah cara token disimpan di `google_workspace_tokens`
- Jangan drop kolom `discipline` lama dari database
- Jangan ubah RLS policies yang sudah ada
- Jangan ubah `buildRekaDriveFolderName` — naming convention tetap sama
