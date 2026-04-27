# Phase 04 — Public API & Webhook

> Baca `BRIEFING.md` dulu sebelum mulai.
> Estimasi: 2–3 minggu

---

## Konteks

Sekarang Reka OS tidak bisa "bicara" ke sistem lain secara otomatis. Kalau mau integrasi ke software accounting (Jurnal, Mekari, Buku Kas, dll), Zapier, atau tools internal lain — semuanya harus manual.

Phase ini membangun dua hal:
1. **Public REST API** — endpoint yang bisa dipanggil dari luar dengan API key
2. **Webhook system** — OS otomatis kirim HTTP POST ke URL eksternal saat ada event tertentu

---

# FITUR A — Public REST API

## Prinsip Desain

- Base URL: `/api/v1/`
- Auth: API Key di header `Authorization: Bearer {api_key}`
- Format response: JSON
- Error format konsisten: `{ "error": "pesan", "code": "ERROR_CODE" }`
- Success format: `{ "data": [...], "meta": { "total": N, "page": 1 } }`
- Versi di URL agar tidak breaking kalau ada perubahan di masa depan

## Step A1 — API Key System

### Database Migration

Buat `supabase/migrations/XXXX_api_keys.sql`:

```sql
-- ============================================================
-- API KEYS untuk Public API
-- ============================================================

create table if not exists public.api_keys (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) >= 1),
  key_hash    text not null unique,  -- Simpan hash, bukan plain text
  key_prefix  text not null,         -- Tampilkan prefix untuk identifikasi (rek_xxxx...)
  created_by  uuid references public.profiles(id),
  last_used_at timestamptz,
  expires_at  timestamptz,
  is_active   boolean not null default true,
  scopes      text[] not null default '{}',  -- ['projects:read', 'invoices:read', dll]
  created_at  timestamptz not null default now()
);

create index api_keys_key_hash_idx on api_keys(key_hash);
create index api_keys_created_by_idx on api_keys(created_by);

-- RLS: hanya direktur yang bisa manage API keys
alter table public.api_keys enable row level security;

create policy "api_keys_select"
  on public.api_keys for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role = 'direktur'
    )
  );

create policy "api_keys_insert"
  on public.api_keys for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role = 'direktur'
    )
  );

create policy "api_keys_update"
  on public.api_keys for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and system_role = 'direktur'
    )
  );

-- API keys log (audit setiap request)
create table if not exists public.api_request_logs (
  id          uuid primary key default gen_random_uuid(),
  api_key_id  uuid references public.api_keys(id) on delete set null,
  method      text,
  path        text,
  status_code integer,
  ip_address  text,
  created_at  timestamptz not null default now()
);

create index api_request_logs_api_key_id_idx on api_request_logs(api_key_id);
create index api_request_logs_created_at_idx on api_request_logs(created_at desc);
```

### Helper: Validate API Key

Buat `lib/api/auth.ts`:

```ts
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export type ApiKeyValidationResult =
  | { valid: true; keyId: string; scopes: string[] }
  | { valid: false; error: string }

/**
 * Validasi API key dari Authorization header.
 * Format header: "Bearer rek_xxxxxxxxxx"
 */
export async function validateApiKey(authHeader: string | null): Promise<ApiKeyValidationResult> {
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false, error: 'Missing or invalid Authorization header' }
  }

  const rawKey = authHeader.slice(7).trim()
  if (!rawKey.startsWith('rek_')) {
    return { valid: false, error: 'Invalid API key format' }
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  const supabase = createSupabaseAdminClient()
  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, is_active, expires_at, scopes')
    .eq('key_hash', keyHash)
    .single()

  if (!apiKey) return { valid: false, error: 'Invalid API key' }
  if (!apiKey.is_active) return { valid: false, error: 'API key is disabled' }
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return { valid: false, error: 'API key has expired' }
  }

  // Update last_used_at (fire and forget)
  void supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', apiKey.id)

  return { valid: true, keyId: apiKey.id, scopes: apiKey.scopes }
}

/** Generate API key baru */
export function generateApiKey(): { raw: string; hash: string; prefix: string } {
  const random = crypto.randomBytes(32).toString('hex')
  const raw = `rek_${random}`
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  const prefix = raw.slice(0, 12)
  return { raw, hash, prefix }
}
```

### Helper: Standard Response

Buat `lib/api/response.ts`:

```ts
import { NextResponse } from 'next/server'

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return NextResponse.json({ data, meta }, { status: 200 })
}

export function apiError(message: string, status: number, code?: string) {
  return NextResponse.json({ error: message, code }, { status })
}

export function apiUnauthorized() {
  return apiError('Unauthorized', 401, 'UNAUTHORIZED')
}

export function apiForbidden() {
  return apiError('Forbidden: insufficient scope', 403, 'FORBIDDEN')
}

export function apiNotFound(resource = 'Resource') {
  return apiError(`${resource} not found`, 404, 'NOT_FOUND')
}
```

## Step A2 — Endpoint: Projects

Buat `app/api/v1/projects/route.ts`:

```ts
import { validateApiKey } from '@/lib/api/auth'
import { apiSuccess, apiUnauthorized, apiForbidden } from '@/lib/api/response'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const auth = await validateApiKey(request.headers.get('Authorization'))
  if (!auth.valid) return apiUnauthorized()
  if (!auth.scopes.includes('projects:read')) return apiForbidden()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100)
  const status = searchParams.get('status')

  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('projects')
    .select('id, code, name, status, start_date, deadline, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1)

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query
  if (error) return apiError(error.message, 500)

  return apiSuccess(data, { total: count, page, limit })
}
```

Buat juga:
- `app/api/v1/projects/[id]/route.ts` — GET detail satu project
- `app/api/v1/tasks/route.ts` — GET list tasks (filter by project_id)
- `app/api/v1/invoices/route.ts` — GET list invoices
- `app/api/v1/invoices/[id]/route.ts` — GET detail invoice

Semua endpoint **hanya GET** dulu. Tidak perlu POST/PUT/DELETE untuk phase ini.

## Step A3 — Halaman Manajemen API Key

Buat `app/(protected)/settings/api-keys/page.tsx`.

Hanya bisa diakses oleh direktur. Tampilan:

```
API Keys
────────────────────────────────────
Key 1: "Integrasi Jurnal"    [Prefix: rek_a1b2c3...]
  Scope: projects:read, invoices:read
  Dibuat: 1 Jan 2026  |  Terakhir dipakai: tadi
  [Nonaktifkan] [Hapus]

Key 2: "Zapier webhook"      [Prefix: rek_x9y8z7...]
  Scope: projects:read
  [Nonaktifkan] [Hapus]

[+ Generate API Key Baru]
```

Dialog generate key baru:
- Input: Nama key (required)
- Checkbox scopes: `projects:read`, `tasks:read`, `invoices:read`, `clients:read`
- Setelah generate, tampilkan raw key SEKALI SAJA dengan pesan: "Simpan key ini sekarang. Tidak akan bisa ditampilkan lagi."
- Tombol copy ke clipboard

---

# FITUR B — Webhook System

## Konsep

Webhook = ketika ada event di OS, sistem otomatis kirim HTTP POST ke URL yang sudah didaftarkan.

Contoh use case:
- Invoice baru dibuat → kirim ke software accounting
- Project status berubah ke "completed" → kirim notifikasi ke sistem lain
- Payment diterima → update sistem ERP

## Step B1 — Database Migration

Buat `supabase/migrations/XXXX_webhooks.sql`:

```sql
-- ============================================================
-- WEBHOOK ENDPOINTS
-- ============================================================

create table if not exists public.webhook_endpoints (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  url         text not null check (url like 'https://%'),  -- Hanya HTTPS
  secret      text not null,   -- Dipakai untuk verifikasi signature
  events      text[] not null, -- Event yang di-subscribe
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- Log setiap webhook yang dikirim
create table if not exists public.webhook_delivery_logs (
  id              uuid primary key default gen_random_uuid(),
  webhook_id      uuid not null references public.webhook_endpoints(id) on delete cascade,
  event_type      text not null,
  payload         jsonb not null,
  response_status integer,
  response_body   text,
  error           text,
  delivered_at    timestamptz not null default now(),
  duration_ms     integer
);

create index webhook_delivery_logs_webhook_id_idx on webhook_delivery_logs(webhook_id);
create index webhook_delivery_logs_delivered_at_idx on webhook_delivery_logs(delivered_at desc);

-- RLS: hanya direktur
alter table public.webhook_endpoints enable row level security;
alter table public.webhook_delivery_logs enable row level security;

create policy "webhook_endpoints_all"
  on public.webhook_endpoints for all
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and system_role = 'direktur'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and system_role = 'direktur'
    )
  );

create policy "webhook_delivery_logs_select"
  on public.webhook_delivery_logs for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and system_role = 'direktur'
    )
  );
```

## Step B2 — Event Types yang Didukung

Definisikan di `lib/webhooks/events.ts`:

```ts
export const WEBHOOK_EVENTS = {
  // Projects
  'project.created': 'Project baru dibuat',
  'project.status_changed': 'Status project berubah',
  'project.completed': 'Project selesai',

  // Invoices
  'invoice.created': 'Invoice baru dibuat',
  'invoice.paid': 'Invoice lunas',

  // Payments
  'payment.received': 'Pembayaran diterima',

  // Tasks
  'task.completed': 'Task selesai',
} as const

export type WebhookEventType = keyof typeof WEBHOOK_EVENTS
```

## Step B3 — Webhook Dispatcher

Buat `lib/webhooks/dispatch.ts`:

```ts
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'
import type { WebhookEventType } from './events'

export async function dispatchWebhook(
  eventType: WebhookEventType,
  payload: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient()

  // Ambil semua webhook yang subscribe ke event ini
  const { data: webhooks } = await supabase
    .from('webhook_endpoints')
    .select('id, url, secret')
    .eq('is_active', true)
    .contains('events', [eventType])

  if (!webhooks || webhooks.length === 0) return

  const body = JSON.stringify({
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  })

  // Kirim ke semua endpoint secara parallel
  await Promise.allSettled(
    webhooks.map(webhook => deliverWebhook(webhook, eventType, body, payload))
  )
}

async function deliverWebhook(
  webhook: { id: string; url: string; secret: string },
  eventType: string,
  body: string,
  payload: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient()
  const startTime = Date.now()

  // Buat HMAC signature untuk verifikasi
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(body)
    .digest('hex')

  let responseStatus: number | null = null
  let responseBody: string | null = null
  let error: string | null = null

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Reka-Signature': `sha256=${signature}`,
        'X-Reka-Event': eventType,
      },
      body,
      signal: AbortSignal.timeout(10000), // Timeout 10 detik
    })

    responseStatus = res.status
    responseBody = await res.text().catch(() => null)
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
  }

  // Log hasil pengiriman
  await supabase.from('webhook_delivery_logs').insert({
    webhook_id: webhook.id,
    event_type: eventType,
    payload,
    response_status: responseStatus,
    response_body: responseBody,
    error,
    duration_ms: Date.now() - startTime,
  })
}
```

## Step B4 — Trigger Webhook di Server Actions

Tambahkan `dispatchWebhook` di action-action yang relevan.

Contoh di `lib/invoices/actions.ts` — setelah invoice dibuat berhasil:
```ts
import { dispatchWebhook } from '@/lib/webhooks/dispatch'

// Di dalam createInvoice():
// ... setelah insert berhasil ...
void dispatchWebhook('invoice.created', {
  invoice_id: data.id,
  project_id: data.project_id,
  amount: data.total_amount,
  client_id: data.client_id,
})
```

Contoh di `lib/projects/actions.ts` — setelah status project berubah:
```ts
void dispatchWebhook('project.status_changed', {
  project_id: projectId,
  old_status: oldStatus,
  new_status: newStatus,
})
```

Penting:
- Gunakan `void` agar dispatch tidak blocking
- Jangan tunggu response webhook sebelum return ke user
- Kalau webhook gagal, user tidak perlu tahu

## Step B5 — Halaman Manajemen Webhook

Tambahkan di `app/(protected)/settings/` — bisa jadi tab baru di halaman settings atau halaman terpisah `/settings/webhooks`.

Tampilan:
```
Webhook Endpoints
──────────────────────────────────────────────────
Endpoint 1: "Accounting Integration"
  URL: https://app.jurnal.id/webhooks/reka
  Events: invoice.created, invoice.paid, payment.received
  Status: ✅ Active
  [Lihat Log] [Edit] [Hapus]

[+ Tambah Webhook]
```

Dialog Log:
- Tabel 20 entri terakhir: timestamp, event type, status code, durasi
- Bisa filter berdasarkan status (success/failed)

---

## Dokumentasi API (Buat juga!)

Buat `app/(protected)/settings/api-docs/page.tsx` atau halaman statis sederhana yang mendokumentasikan endpoint yang tersedia.

Minimal berisi:
- Base URL
- Format auth header
- List endpoints dengan contoh request/response
- List webhook event types dan format payload-nya

---

## Checklist Sebelum Selesai

### Fitur A — Public API
- [ ] Migration `api_keys` berhasil
- [ ] Bisa generate API key baru di settings
- [ ] Endpoint `GET /api/v1/projects` berfungsi dengan Bearer token
- [ ] Endpoint `GET /api/v1/invoices` berfungsi
- [ ] Request tanpa token mendapat 401
- [ ] Request dengan scope yang salah mendapat 403
- [ ] `last_used_at` ter-update setiap request
- [ ] Response format konsisten

### Fitur B — Webhooks
- [ ] Migration `webhook_endpoints` dan `webhook_delivery_logs` berhasil
- [ ] Bisa tambah webhook endpoint baru di settings
- [ ] Webhook terkirim saat invoice dibuat
- [ ] Webhook terkirim saat project status berubah
- [ ] Signature HMAC ada di header `X-Reka-Signature`
- [ ] Log pengiriman tersimpan (success dan failed)
- [ ] Timeout 10 detik diterapkan
- [ ] Webhook gagal tidak mempengaruhi user experience (fire and forget)
