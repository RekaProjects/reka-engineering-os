# Reka Engineering OS — Fix Prompts

Semua file ini adalah prompt siap-paste ke **Claude** (bukan Cursor).
Kerjakan **secara berurutan** karena beberapa stage saling bergantung.

---

## Urutan Pengerjaan

| # | File | Scope | Estimasi | Risiko |
|---|---|---|---|---|
| 1 | `stage-1-permissions-fix.md` | Fix 3 predicate salah di `permissions.ts` | ~10 menit | 🟢 Rendah |
| 2 | `stage-2-approval-notification.md` | Apply migration SQL + verifikasi notif end-to-end | ~20 menit | 🟡 Medium |
| 3 | `stage-3-google-drive.md` | Setup koneksi Google Drive + perbaiki UI status | ~20 menit | 🟡 Medium |
| 4 | `stage-4-manajer-team-visibility.md` | Tambah visibility tim terbatas untuk Manajer | ~30 menit | 🟡 Medium |

---

## Cara Pakai

1. Buka file stage yang mau dikerjakan
2. Copy semua isinya
3. Paste ke Claude (new conversation)
4. Biarkan Claude baca file-file yang disebutkan di prompt dan lakukan perubahan
5. Jalankan `npx tsc --noEmit` setelah selesai untuk pastikan tidak ada error TypeScript
6. Test manual sesuai bagian **Verification** di masing-masing prompt

---

## Catatan Penting

### Stage 2 memerlukan langkah manual di Supabase:
- Buka Supabase SQL Editor
- Copy isi file `supabase/migrations/0034_approval_notification_trigger.sql`
- Jalankan di SQL Editor
- Claude tidak bisa melakukan ini otomatis — harus dilakukan secara manual

### Stage 3 memerlukan langkah manual di Vercel + Google Cloud Console:
- Set `NEXT_PUBLIC_APP_URL` ke production URL di Vercel env vars
- Add production redirect URI di Google Cloud Console OAuth credentials
- Complete OAuth flow dengan login di app → Settings → Finance → Hubungkan Google Drive

### Stage 4 adalah enhancement (opsional tapi recommended):
- Implementasi visibilitas tim terbatas untuk role Manajer
- Sesuai spesifikasi sistem yang sudah disepakati
- Tidak breaking — hanya menambah akses baru

---

## Summary Masalah yang Diperbaiki

### Stage 1 — Permissions
- ❌ TD bisa akses FX Rates (harusnya Finance + Direktur saja)
- ❌ TD bisa akses Payment Accounts (harusnya Finance + Direktur saja)
- ❌ Finance bisa akses halaman Settings (harusnya TD + Direktur saja)

### Stage 2 — Approval Notification (Bug 1 + Bug 2)
- ❌ Direktur tidak dapat notifikasi saat project masuk `pending_approval`
- ❌ Project lead tidak dapat notifikasi saat project diapprove/reject
- ⚠️ Migration file sudah ada (`0034`) tapi belum diapply ke Supabase

### Stage 3 — Google Drive (Bug 3)
- ❌ Folder Google Drive tidak otomatis dibuat saat project baru dibuat
- ❌ Penyebab: OAuth belum pernah diselesaikan, tidak ada token tersimpan
- ❌ `NEXT_PUBLIC_APP_URL` kemungkinan belum di-set ke production URL di Vercel

### Stage 4 — Manajer Team Visibility
- ❌ Manajer tidak bisa lihat ketersediaan tim sama sekali
- ✅ Seharusnya bisa lihat: nama, status ketersediaan, skill tags
- ✅ Tidak boleh lihat: rate, gaji, data perbankan
