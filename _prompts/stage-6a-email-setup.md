# Stage 6a — Email Setup: Install Resend + Client + Templates

## Rules (baca dulu sebelum mulai)

- **JANGAN** modifikasi file yang sudah ada di tahap ini
- **JANGAN** install package selain `resend`
- **JANGAN** buat API route di tahap ini — itu Stage 6c
- **HANYA** buat file baru: `lib/email/client.ts`, `lib/email/templates/invite.ts`, `lib/email/templates/notification.ts`
- Semua kode harus **TypeScript strict** — tidak boleh ada `any`, tidak boleh ada `ts-ignore`
- Tidak ada perubahan database / migration apapun

---

## Context

Ini adalah **Next.js 15 App Router + TypeScript strict + Supabase** project.

Stack yang relevan:
- Runtime: Node.js (bukan Edge) — Resend SDK aman dipakai
- Env vars diakses via `process.env` — **bukan** `NEXT_PUBLIC_` untuk secret
- Path alias `@/` sudah dikonfigurasi ke root project

Email provider yang dipilih: **Resend** — karena SDK-nya minimal dan bekerja native di Next.js server-side.

---

## Step 1 — Install Resend

Jalankan di terminal:

```bash
npm install resend
```

Setelah install, verifikasi `resend` muncul di `package.json` dependencies.

---

## Step 2 — Tambah Env Vars

Tambahkan ke file `.env.local` (jangan commit file ini):

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
RESEND_FROM=noreply@reka-engineering.com
```

**Catatan:**
- `RESEND_API_KEY` didapat dari Resend dashboard → API Keys
- `RESEND_FROM` harus menggunakan domain yang sudah diverifikasi di Resend
- Untuk testing lokal bisa pakai `onboarding@resend.dev` (Resend default, hanya bisa kirim ke email sendiri)
- Kedua env var ini **tidak boleh** prefix `NEXT_PUBLIC_` — server-only

---

## Step 3 — Buat Resend Client Singleton

Buat file **baru**: `lib/email/client.ts`

```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing env var: RESEND_API_KEY')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_ADDRESS =
  process.env.RESEND_FROM ?? 'noreply@reka-engineering.com'
```

**Aturan:**
- Export dua hal: `resend` (client instance) dan `FROM_ADDRESS` (string)
- Throw error di module level jika env var tidak ada — supaya crash saat startup, bukan saat runtime
- Tidak ada logic lain di file ini

---

## Step 4 — Buat Template Invite Email

Buat file **baru**: `lib/email/templates/invite.ts`

Template ini menghasilkan subject + HTML body untuk email undangan member baru.

```typescript
const APP_NAME = 'ReKa Engineering OS'

export interface InviteEmailData {
  recipientName: string | null
  inviterName: string
  inviteUrl: string
  expiresAt: string // ISO string
}

export function buildInviteEmail(data: InviteEmailData): {
  subject: string
  html: string
} {
  const greeting = data.recipientName
    ? `Halo, ${data.recipientName}!`
    : 'Halo!'

  const expiryDate = new Date(data.expiresAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const subject = `Undangan bergabung ke ${APP_NAME}`

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:10px;border:1px solid #e4e4e7;padding:40px 32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#71717a;letter-spacing:0.05em;text-transform:uppercase;">${APP_NAME}</p>
              <h1 style="margin:0 0 24px;font-size:22px;font-weight:700;color:#09090b;">Kamu diundang untuk bergabung</h1>

              <p style="margin:0 0 16px;font-size:15px;color:#3f3f46;line-height:1.6;">
                ${greeting}
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">
                <strong>${data.inviterName}</strong> mengundang kamu untuk bergabung ke <strong>${APP_NAME}</strong>.
                Klik tombol di bawah untuk mengatur password dan melengkapi profilmu.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td>
                    <a
                      href="${data.inviteUrl}"
                      style="display:inline-block;padding:12px 24px;background:#18181b;color:#fafafa;border-radius:7px;font-size:14px;font-weight:600;text-decoration:none;"
                    >
                      Aktifkan Akunmu →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;font-size:13px;color:#71717a;line-height:1.5;">
                Atau copy link berikut ke browser:
              </p>
              <p style="margin:0 0 24px;font-size:12px;color:#71717a;word-break:break-all;font-family:ui-monospace,monospace;background:#f4f4f5;padding:10px 12px;border-radius:6px;">
                ${data.inviteUrl}
              </p>

              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 20px;" />

              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Link ini berlaku sampai <strong>${expiryDate}</strong>.<br />
                Jika kamu tidak merasa diundang, abaikan email ini.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return { subject, html }
}
```

---

## Step 5 — Buat Template Notification Email

Buat file **baru**: `lib/email/templates/notification.ts`

Template ini dipakai untuk semua jenis notifikasi in-app yang di-mirror ke email.

```typescript
const APP_NAME = 'ReKa Engineering OS'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.reka-engineering.com'

export interface NotificationEmailData {
  recipientName: string
  title: string
  body: string | null
  link: string | null
  notificationType: string
}

export function buildNotificationEmail(data: NotificationEmailData): {
  subject: string
  html: string
} {
  const subject = `${data.title} — ${APP_NAME}`

  const ctaButton = data.link
    ? `
      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td>
            <a
              href="${APP_URL}${data.link}"
              style="display:inline-block;padding:11px 22px;background:#18181b;color:#fafafa;border-radius:7px;font-size:14px;font-weight:600;text-decoration:none;"
            >
              Lihat Detail →
            </a>
          </td>
        </tr>
      </table>`
    : ''

  const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:520px;background:#ffffff;border-radius:10px;border:1px solid #e4e4e7;padding:40px 32px;">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#71717a;letter-spacing:0.05em;text-transform:uppercase;">${APP_NAME}</p>
              <h1 style="margin:0 0 20px;font-size:20px;font-weight:700;color:#09090b;">${data.title}</h1>

              <p style="margin:0 0 8px;font-size:14px;color:#71717a;">Halo, ${data.recipientName}.</p>

              ${data.body ? `<p style="margin:0 0 24px;font-size:15px;color:#3f3f46;line-height:1.6;">${data.body}</p>` : ''}

              ${ctaButton}

              <hr style="border:none;border-top:1px solid #e4e4e7;margin:0 0 20px;" />

              <p style="margin:0;font-size:12px;color:#a1a1aa;line-height:1.6;">
                Notifikasi ini dikirim dari <strong>${APP_NAME}</strong>.<br />
                Login untuk melihat semua notifikasi: <a href="${APP_URL}/dashboard" style="color:#71717a;">${APP_URL}/dashboard</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()

  return { subject, html }
}
```

---

## Step 6 — Verifikasi TypeScript

Jalankan:

```bash
npx tsc --noEmit
```

Tidak boleh ada error. Jika ada import error dari `resend`, pastikan `npm install resend` sudah dijalankan.

---

## Struktur File Setelah Stage 6a

```
lib/
  email/
    client.ts              ← Resend singleton + FROM_ADDRESS
    templates/
      invite.ts            ← buildInviteEmail()
      notification.ts      ← buildNotificationEmail()
```

---

## Yang TIDAK dilakukan di stage ini

- ❌ Belum ada pengiriman email sungguhan
- ❌ Belum ada perubahan ke existing files
- ❌ Belum ada API route
- ❌ Belum ada perubahan database

Stage ini selesai ketika `npx tsc --noEmit` lulus tanpa error dan ketiga file baru sudah ada.
