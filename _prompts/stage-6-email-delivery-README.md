# Stage 6 — Email Delivery (Invite + Notifikasi)

Prompt ini dibagi **3 sub-stage** karena masing-masing punya dependency berbeda.
Kerjakan **berurutan** — 6a harus selesai sebelum 6b dan 6c.

---

## Urutan Pengerjaan

| # | File | Scope | Estimasi | Risiko |
|---|---|---|---|---|
| 6a | `stage-6a-email-setup.md` | Install Resend, buat email client + 2 template | ~15 menit | 🟢 Rendah — file baru semua, tidak ada perubahan existing |
| 6b | `stage-6b-invite-email.md` | Wire email ke `createInvite` action, update UI feedback | ~20 menit | 🟡 Medium — modifikasi 1 action + 1 component |
| 6c | `stage-6c-notification-webhook.md` | Buat webhook endpoint, setup Supabase Database Webhook | ~25 menit | 🟡 Medium — 1 file baru + 1 langkah manual Supabase |

---

## Yang TIDAK dikerjakan di Stage 6 ini

- ❌ Slack webhook — diputuskan skip
- ❌ Notif untuk deliverable / comment — stage terpisah
- ❌ Perubahan schema/migration — tidak ada sama sekali
- ❌ Perubahan ke auth flow — onboarding tetap sama

---

## Cara Pakai

1. Buka file stage yang mau dikerjakan
2. Copy **semua** isinya
3. Paste ke Cursor (new chat, mode Agent)
4. Setelah selesai jalankan: `npx tsc --noEmit`
5. Test manual sesuai bagian **Verification** di tiap file

---

## Prerequisite sebelum mulai

- [ ] Buat akun Resend di https://resend.com (free tier cukup)
- [ ] Verify domain pengirim di Resend (atau pakai `onboarding@resend.dev` untuk testing)
- [ ] Copy API Key dari Resend dashboard
- [ ] Siapkan 2 env var yang akan dipakai:
  ```
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
  RESEND_FROM=noreply@reka-engineering.com
  ```
