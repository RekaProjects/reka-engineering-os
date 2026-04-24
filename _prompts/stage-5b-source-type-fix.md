# Stage 5b — Fix Source → Jenis Project (Derive source_type Otomatis)

## Context

Next.js 15 App Router, TypeScript strict, Supabase, React 19. Project ini adalah Reka Engineering OS.

Ini adalah bugfix lanjutan dari Stage 5. Tidak ada migration database yang dibutuhkan.

---

## Masalah

Di form New/Edit Project, ada dua field yang seharusnya saling terkait tapi sekarang berdiri sendiri:

- **Source** — Direct, Fiverr, Upwork, Referral, Other
- **Jenis Project** — radio: `Domestic (Direct)` atau `Platform (Fiverr/Upwork)`

Kondisi yang tidak logis bisa terjadi:
- Source = `Direct` + Jenis = `Platform` ← salah
- Source = `Fiverr` + Jenis = `Domestic` ← salah

Ini menyebabkan folder Google Drive dibuat di lokasi yang salah (misal project Fiverr masuk ke folder `Domestic/` bukan `Platform/`).

---

## Solusi — Derive `source_type` Otomatis dari `source`

Mapping yang benar dan deterministik:

| Source | source_type |
|---|---|
| Fiverr | PLATFORM |
| Upwork | PLATFORM |
| Direct | DOMESTIC |
| Referral | DOMESTIC |
| Other | DOMESTIC |

Hapus radio button "Jenis Project" dari form. Ganti dengan teks info statis yang berubah sesuai Source yang dipilih.

---

## File yang Perlu Dibaca

Baca semua file ini sebelum mulai:
- `components/modules/projects/ProjectForm.tsx`
- `lib/projects/actions.ts`
- `app/(protected)/projects/[id]/page.tsx` — halaman detail project

---

## Perubahan 1 — `lib/projects/actions.ts`

Di server action untuk **create project** dan **edit project**, hapus pembacaan `source_type` dari form data.

Ganti dengan derivasi otomatis:

```ts
// HAPUS baris seperti ini:
// const source_type = formData.get('source_type') as string

// GANTI dengan:
const source = (formData.get('source') as string)?.trim() ?? 'Direct'
const source_type: 'DOMESTIC' | 'PLATFORM' =
  ['Fiverr', 'Upwork'].includes(source) ? 'PLATFORM' : 'DOMESTIC'
```

Pastikan perubahan ini ada di **kedua** action — create dan edit (kalau terpisah). Cari semua tempat yang membaca `source_type` dari `formData` dan ganti dengan derivasi di atas.

---

## Perubahan 2 — `components/modules/projects/ProjectForm.tsx`

### Hapus seluruh blok radio "Jenis project"

Cari dan hapus blok ini (atau yang setara):
```tsx
{/* Jenis project */}
<div>
  <label>Jenis project</label>
  <label>
    <input type="radio" name="source_type" value="DOMESTIC" />
    Domestic (Direct)
  </label>
  <label>
    <input type="radio" name="source_type" value="PLATFORM" />
    Platform (Fiverr/Upwork)
  </label>
  ...teks penjelasan...
</div>
```

Hapus semua teks, label, radio input, dan hidden input yang berkaitan dengan `source_type` dari form.

### Tambah teks info reaktif di bawah field Source

Setelah field Source dropdown, tambahkan teks penjelasan yang berubah otomatis sesuai nilai Source.

**Jika form menggunakan `react-hook-form`:**
```tsx
const watchedSource = watch('source')
const isPlatform = ['Fiverr', 'Upwork'].includes(watchedSource ?? '')
```

**Jika form menggunakan `useState` biasa:**
```tsx
const [selectedSource, setSelectedSource] = useState(initialSource ?? 'Direct')
const isPlatform = ['Fiverr', 'Upwork'].includes(selectedSource)

// Di select onChange:
onChange={(e) => setSelectedSource(e.target.value)}
```

**Teks info yang ditampilkan:**
```tsx
<p className="mt-1.5 text-[0.8125rem]" style={{ color: 'var(--color-text-muted)' }}>
  {isPlatform
    ? 'Billing dan pembayaran dikelola oleh platform — tidak ada termin atau BAST di ReKa OS untuk project ini.'
    : 'Billing domestik — sistem membuat jadwal termin otomatis setelah project disetujui Direktur.'}
</p>
```

Teks ini cukup, tidak perlu radio button sama sekali.

### Hapus juga `defaultValue` atau `defaultChecked` untuk source_type

Cari dan hapus semua referensi ke `source_type` sebagai form field (bukan sebagai data yang ditampilkan).

---

## Perubahan 3 — Halaman Detail Project (Read-only display)

Di `app/(protected)/projects/[id]/page.tsx` (atau component detail project):

**Tidak perlu ubah apa-apa** — label "Domestic" atau "Platform" yang ditampilkan sebagai badge read-only tetap baca dari `project.source_type` yang tersimpan di database. Data di database sudah benar setelah fix di actions.ts.

Pastikan hanya field `source_type` sebagai **tampilan** (bukan input) yang tetap ada.

---

## Perubahan 4 — Cek Konsistensi Data Lama (Opsional)

Kalau ada project lama di database yang punya kombinasi source/source_type yang tidak konsisten, jalankan query ini di Supabase SQL Editor untuk perbaiki:

```sql
-- Fix project yang source-nya Fiverr/Upwork tapi source_type-nya DOMESTIC
UPDATE public.projects
SET source_type = 'PLATFORM'
WHERE source IN ('Fiverr', 'Upwork')
  AND source_type = 'DOMESTIC';

-- Fix project yang source-nya Direct/Referral/Other tapi source_type-nya PLATFORM
UPDATE public.projects
SET source_type = 'DOMESTIC'
WHERE source IN ('Direct', 'Referral', 'Other')
  AND source_type = 'PLATFORM';
```

Ini opsional tapi disarankan untuk konsistensi data yang sudah ada.

---

## Yang Tidak Boleh Diubah

- Jangan ubah kolom `source_type` di database — tetap ada, tetap dipakai
- Jangan ubah field `source` di form — tetap dropdown seperti sekarang
- Jangan ubah logic Drive folder creation di `lib/files/drive-project-folder.ts` — sudah benar, akan otomatis konsisten setelah fix ini
- Jangan ubah RLS policies
- Jangan ubah migration yang sudah ada

---

## Verifikasi

1. `npx tsc --noEmit` — harus zero errors
2. Buka form New Project
3. Pilih Source = **Fiverr** → teks info harus berubah jadi "Billing dan pembayaran dikelola oleh platform..."
4. Pilih Source = **Direct** → teks info harus berubah jadi "Billing domestik..."
5. Submit project dengan Source = Fiverr → cek di database: `source_type` harus `PLATFORM`
6. Submit project dengan Source = Direct → cek di database: `source_type` harus `DOMESTIC`
7. Tidak ada radio button "Jenis Project" yang terlihat di form
