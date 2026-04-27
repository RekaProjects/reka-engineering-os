# Stage 6c — Notification Email via Supabase Webhook

## Prerequisite

Stage 6a **dan** 6b **harus sudah selesai** sebelum ini. Verifikasi:
- [ ] `lib/email/client.ts` ada
- [ ] `lib/email/templates/notification.ts` ada
- [ ] `RESEND_API_KEY` dan `RESEND_FROM` ada di `.env.local`
- [ ] `npx tsc --noEmit` lulus tanpa error

---

## Rules (baca dulu sebelum mulai)

- **HANYA** buat file baru yang disebutkan — jangan modifikasi existing files
- **JANGAN** ubah `lib/notifications/actions.ts` — mark-read tetap server action biasa
- **JANGAN** ubah `hooks/useRealtimeNotifications.ts` — in-app notif tetap jalan sendiri
- **JANGAN** ubah migration SQL apapun
- Endpoint webhook harus menolak request yang tidak punya secret header yang benar — **wajib**
- Semua kode harus **TypeScript strict** — tidak ada `any`
- Email error tidak boleh return HTTP 5xx ke Supabase — return 200 selalu, log error

---

## Context

### Arsitektur notifikasi sekarang:
```
DB trigger (SQL) → INSERT ke notifications table → Supabase Realtime → useRealtimeNotifications hook → bell UI
```

### Arsitektur setelah Stage 6c:
```
DB trigger (SQL) → INSERT ke notifications table → Supabase Realtime → bell UI  (tetap sama)
                                                  ↓
                                    Supabase Database Webhook
                                                  ↓
                               POST /api/email/notify (route baru)
                                                  ↓
                               lookup profiles.email by user_id
                                                  ↓
                                        Resend → inbox
```

### Trigger notifikasi yang sudah ada (tidak perlu diubah):

Dari migration `0032_notifications_realtime.sql`:
- `task_assigned` — member dapat task baru atau reassignment
- `invoice_paid` — creator invoice saat invoice lunas
- `project_status_changed` — project lead saat status project berubah

Dari migration `0034_approval_notification_trigger.sql`:
- `project_pending_approval` — semua direktur saat project masuk antrian approval

### Tabel `notifications` (schema sudah ada, tidak diubah):
```sql
id          uuid
user_id     uuid  -- FK ke profiles.id
type        text  -- 'task_assigned' | 'invoice_paid' | 'project_status_changed' | 'project_pending_approval'
title       text
body        text
link        text
read_at     timestamptz (null = belum dibaca)
created_at  timestamptz
```

### Tabel `profiles`:
- Punya kolom `email text` dan `full_name text`
- Diakses menggunakan Supabase admin client (bypass RLS)

---

## Step 1 — Tambah Env Var Webhook Secret

Tambahkan ke `.env.local`:

```
SUPABASE_WEBHOOK_SECRET=ganti_dengan_string_random_minimal_32_karakter
```

Generate string random, contoh: `xK9mP2qL8nR5tY7wE3jA6cF0bH4iD1vG`

Env var ini akan dipakai sebagai shared secret antara Supabase dan Next.js app.

---

## Step 2 — Buat Fungsi `sendNotificationEmail`

Buat file **baru**: `lib/email/send-notification.ts`

```typescript
import { resend, FROM_ADDRESS } from '@/lib/email/client'
import { buildNotificationEmail } from '@/lib/email/templates/notification'

export interface SendNotificationEmailParams {
  toEmail: string
  recipientName: string
  title: string
  body: string | null
  link: string | null
  notificationType: string
}

/**
 * Fire-and-forget notification email.
 * Errors are logged but NOT rethrown — webhook must always return 200.
 */
export async function sendNotificationEmail(
  params: SendNotificationEmailParams
): Promise<void> {
  const { subject, html } = buildNotificationEmail({
    recipientName: params.recipientName,
    title: params.title,
    body: params.body,
    link: params.link,
    notificationType: params.notificationType,
  })

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject,
      html,
    })

    if (error) {
      console.error('[sendNotificationEmail] Resend error:', error)
    }
  } catch (err) {
    console.error('[sendNotificationEmail] Unexpected error:', err)
  }
}
```

---

## Step 3 — Buat Webhook API Route

Buat file **baru**: `app/api/email/notify/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendNotificationEmail } from '@/lib/email/send-notification'

const WEBHOOK_SECRET = process.env.SUPABASE_WEBHOOK_SECRET

/**
 * POST /api/email/notify
 *
 * Called by Supabase Database Webhook on INSERT to `notifications` table.
 * Payload shape (Supabase webhook format):
 * {
 *   type: 'INSERT',
 *   table: 'notifications',
 *   record: { id, user_id, type, title, body, link, read_at, created_at },
 *   schema: 'public',
 *   old_record: null
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Verify secret header
  const secret = req.headers.get('x-webhook-secret')
  if (!WEBHOOK_SECRET || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse payload
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('record' in payload) ||
    typeof (payload as Record<string, unknown>).record !== 'object'
  ) {
    return NextResponse.json({ error: 'Unexpected payload shape' }, { status: 400 })
  }

  const record = (payload as { record: Record<string, unknown> }).record

  const userId    = typeof record.user_id === 'string' ? record.user_id : null
  const title     = typeof record.title   === 'string' ? record.title   : null
  const body      = typeof record.body    === 'string' ? record.body    : null
  const link      = typeof record.link    === 'string' ? record.link    : null
  const notifType = typeof record.type    === 'string' ? record.type    : 'notification'

  if (!userId || !title) {
    // Non-actionable row — skip silently
    return NextResponse.json({ ok: true, skipped: true })
  }

  // 3. Look up recipient email + name from profiles
  const admin = createAdminClient()
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('email, full_name')
    .eq('id', userId)
    .maybeSingle()

  if (profileError || !profile?.email) {
    console.error('[notify webhook] Profile lookup failed:', profileError?.message ?? 'no email')
    // Return 200 so Supabase does not retry — this is not a transient error
    return NextResponse.json({ ok: true, skipped: true })
  }

  // 4. Send email (fire-and-forget — errors logged inside)
  await sendNotificationEmail({
    toEmail: profile.email,
    recipientName: profile.full_name ?? 'Pengguna',
    title,
    body,
    link,
    notificationType: notifType,
  })

  return NextResponse.json({ ok: true })
}
```

**Aturan ketat:**
- Route ini **tidak boleh** diakses GET — hanya POST
- Secret header harus dicek **sebelum** apapun diproses
- Return `200` (bukan 5xx) untuk semua error yang tidak bisa di-retry (missing profile, dsb) — supaya Supabase tidak flood retry
- Hanya return `401` untuk secret yang salah — satu-satunya case yang mau di-retry

---

## Step 4 — Verifikasi TypeScript

```bash
npx tsc --noEmit
```

Tidak boleh ada error baru.

---

## Step 5 — Setup Supabase Database Webhook (MANUAL)

**Ini langkah manual di Supabase Dashboard — tidak bisa dilakukan lewat kode.**

1. Buka: https://supabase.com/dashboard/project/sjisdvcgqcqxbnszruco
2. Sidebar kiri → **Database** → **Webhooks**
3. Klik **Create a new hook**
4. Isi form:

   | Field | Value |
   |---|---|
   | Name | `on_notification_insert_send_email` |
   | Table | `notifications` |
   | Events | `INSERT` (checklist INSERT saja) |
   | Type | `HTTP Request` |
   | Method | `POST` |
   | URL | `https://[domain-production]/api/email/notify` |
   | HTTP Headers | Tambah header: `x-webhook-secret` = value dari `SUPABASE_WEBHOOK_SECRET` |

5. Klik **Create webhook**

**Catatan penting:**
- URL harus production URL (`NEXT_PUBLIC_APP_URL`) — Supabase tidak bisa hit `localhost`
- Untuk development lokal, gunakan **ngrok** atau **Cloudflare Tunnel** untuk expose localhost
- Nilai `x-webhook-secret` harus persis sama dengan `SUPABASE_WEBHOOK_SECRET` di `.env.local` / Vercel env vars

---

## Step 6 — Tambah Env Var ke Vercel (Production)

Di Vercel dashboard, tambahkan environment variable:
```
SUPABASE_WEBHOOK_SECRET = [nilai yang sama dengan di .env.local]
```

Tanpa ini, webhook di production akan selalu return `401`.

---

## Verifikasi End-to-End

### Test 1 — Project pending approval (Direktur dapat email)
1. Login sebagai TD/Manajer
2. Buat project baru → status otomatis `pending_approval`
3. Cek inbox email akun Direktur → harus ada email "Proyek perlu persetujuan"

### Test 2 — Invoice lunas (creator dapat email)
1. Login sebagai Finance
2. Update status invoice ke `paid`
3. Cek inbox email user yang create invoice → harus ada email "Invoice lunas"

### Test 3 — Task di-assign (assignee dapat email)
1. Login sebagai Manajer/TD
2. Assign task ke salah satu member
3. Cek inbox email member tersebut → harus ada email "Task baru ditugaskan"

### Test keamanan — Tanpa secret header
```bash
curl -X POST https://[domain]/api/email/notify \
  -H "Content-Type: application/json" \
  -d '{"record":{"user_id":"fake","title":"test"}}'
# Expected response: 401 Unauthorized
```

---

## Struktur File Setelah Stage 6c

```
lib/
  email/
    client.ts                    ← tidak berubah
    send-invite.ts               ← tidak berubah
    send-notification.ts         ← BARU
    templates/
      invite.ts                  ← tidak berubah
      notification.ts            ← tidak berubah
app/
  api/
    email/
      notify/
        route.ts                 ← BARU
```

---

## Yang TIDAK dilakukan di stage ini

- ❌ Slack webhook — diputuskan skip
- ❌ Task deadline reminder (butuh cron job — stage terpisah)
- ❌ Notif untuk deliverable / comment — stage terpisah
- ❌ Perubahan database / migration
- ❌ Perubahan ke in-app notification hook
