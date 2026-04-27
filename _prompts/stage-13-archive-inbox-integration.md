# Stage 13 — Archive Inbox Integration (OS → EngDocs)
> Repo: `reka-engineering-os`
> **Prasyarat:** Fix 2 di repo `reka-engineering-document` sudah selesai dan endpoint
> `/api/archive/notify-inbox` sudah berjalan.
> Buka Cursor di folder ini, paste seluruh isi blok prompt di bawah ke Cursor Chat.

---

```
Halo Cursor! Tambahkan integrasi archive ke `lib/projects/actions.ts`.

Ketika project statusnya diubah menjadi `'closed'`, OS harus secara otomatis mengirim
snapshot data project beserta daftar file R2-nya ke EngDocs Document App melalui API
internal. Ini adalah flow "fire and forget" — jika pengiriman gagal, proses close project
tetap berhasil dan tidak diblokir.

Jangan ubah logika yang sudah ada. Hanya tambah kode di dalam dan di bawah fungsi
`updateProjectStatus` yang sudah ada di `lib/projects/actions.ts`.

---

### Perubahan di `lib/projects/actions.ts`

**Langkah 1:** Di dalam fungsi `updateProjectStatus`, tambahkan blok berikut tepat
setelah baris `if (error) throw new Error(error.message)` dan **sebelum** `revalidatePath`:

```ts
// Saat project ditutup: kirim ke EngDocs archive inbox (fire & forget, tidak block close)
if (status === 'closed') {
  void pushProjectToArchiveInbox(supabase, id, project).catch((err) =>
    console.error('[archive-inbox] push failed (non-blocking):', err)
  )
}
```

**Langkah 2:** Tambahkan fungsi helper baru di bawah `updateProjectStatus`
(masih di file `lib/projects/actions.ts` yang sama):

```ts
async function pushProjectToArchiveInbox(
  supabase: Awaited<ReturnType<typeof createServerClient>>,
  projectId: string,
  project: NonNullable<Awaited<ReturnType<typeof getProjectById>>>,
): Promise<void> {
  const appUrl = process.env.ENGDOCS_APP_URL?.replace(/\/$/, '')
  const secret = process.env.ENGDOCS_INTERNAL_SECRET
  if (!appUrl || !secret) return // env belum dikonfigurasi, skip diam-diam

  // Hanya ambil file yang tersimpan di R2 (bukan Google Drive / manual link)
  const { data: r2Files } = await supabase
    .from('project_files')
    .select('file_name, r2_key, file_size_bytes, mime_type')
    .eq('project_id', projectId)
    .eq('provider', 'r2')
    .not('r2_key', 'is', null)

  if (!r2Files || r2Files.length === 0) return // tidak ada file R2, tidak perlu archive

  // Ambil nama & kode client
  const { data: clientRow } = await supabase
    .from('clients')
    .select('client_name, client_code')
    .eq('id', project.client_id)
    .maybeSingle()

  const projectYear =
    project.actual_completion_date
      ? new Date(project.actual_completion_date).getFullYear()
      : new Date(project.target_due_date ?? project.start_date).getFullYear()

  const disciplines = project.disciplines?.length
    ? project.disciplines
    : project.discipline
      ? [project.discipline]
      : []

  await fetch(`${appUrl}/api/archive/notify-inbox`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': secret,
    },
    body: JSON.stringify({
      source_project_id: project.id,
      source_project_code: project.project_code,
      source_payload: {
        project_name: project.name,
        client_display_name: clientRow?.client_name ?? 'Unknown Client',
        client_code: clientRow?.client_code ?? null,
        client_id: project.client_id,
        project_year: projectYear,
        disciplines,
        contract_value_idr:
          project.contract_currency === 'IDR' ? (project.contract_value ?? null) : null,
      },
      source_files: r2Files.map((f) => ({
        r2_key: f.r2_key as string,
        filename: f.file_name,
        size_bytes: f.file_size_bytes ?? 0,
        mime_type: f.mime_type ?? 'application/octet-stream',
      })),
    }),
  })
}
```

---

### Tambahkan env var baru ke `.env.local` di repo OS

Tambahkan dua baris ini ke file `.env.local`:

```env
# EngDocs Document App — archive inbox integration
ENGDOCS_APP_URL=http://localhost:3001
ENGDOCS_INTERNAL_SECRET=<salin nilai INTERNAL_API_SECRET dari .env.local EngDocs>
```

Untuk production, ganti `http://localhost:3001` dengan URL EngDocs yang sudah di-deploy.

---

### Checklist verifikasi setelah Cursor selesai:

1. `npx tsc --noEmit` di repo OS — pastikan tidak ada TypeScript error
2. Isi `.env.local` OS dengan `ENGDOCS_APP_URL` dan `ENGDOCS_INTERNAL_SECRET`
3. Test manual end-to-end:
   a. Pastikan EngDocs app jalan di localhost:3001
   b. Buat atau cari project OS yang punya minimal 1 file dengan provider = 'r2'
   c. Ubah status project ke 'closed' dari halaman edit project
   d. Buka EngDocs → `/archive-inbox` → item harus muncul dalam beberapa detik
4. Jika project tidak punya file R2, inbox tidak akan terisi (by design —
   project tanpa file R2 tidak perlu diarsipkan ke Document Library)
```
