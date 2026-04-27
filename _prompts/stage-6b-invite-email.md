# Stage 6b — Wire Email ke Invite Flow

## Prerequisite

Stage 6a **harus sudah selesai** sebelum ini. Verifikasi:
- [ ] `lib/email/client.ts` ada
- [ ] `lib/email/templates/invite.ts` ada
- [ ] `npm install resend` sudah dijalankan
- [ ] `RESEND_API_KEY` dan `RESEND_FROM` ada di `.env.local`

---

## Rules (baca dulu sebelum mulai)

- **HANYA** modifikasi file yang disebutkan secara eksplisit di prompt ini
- **JANGAN** ubah schema database / migration
- **JANGAN** ubah flow onboarding (`app/onboarding/[token]/page.tsx`) — tetap sama
- **JANGAN** hapus `CopyLinkButton` dari `/team` page — tetap ada sebagai fallback
- Pengiriman email **tidak boleh** memblock redirect — kalau email gagal, invite tetap berhasil dibuat
- Semua kode harus **TypeScript strict** — tidak ada `any`, tidak ada `as unknown`
- Gunakan `try/catch` untuk semua panggilan ke Resend — jangan biarkan email error crash server action

---

## Context

### Flow sekarang (sebelum Stage 6b):
```
TD isi form → createInvite() → insert ke DB → redirect /team?invited=token
→ TD harus copy link manual dari tabel → kirim sendiri ke member
```

### Flow setelah Stage 6b:
```
TD isi form → createInvite() → insert ke DB → sendInviteEmail() (fire & forget) → redirect /team?invited=token
→ Member terima email langsung → klik link → onboarding
(CopyLinkButton tetap ada sebagai fallback kalau email bounced)
```

### File yang relevan:
- `lib/invites/actions.ts` — server action yang perlu dimodifikasi
- `lib/invites/queries.ts` — baca untuk memahami tipe data (jangan diubah)
- `components/modules/team/InviteForm.tsx` — baca untuk memahami form (modifikasi kecil untuk feedback)
- `app/(protected)/team/page.tsx` — baca saja, jangan diubah

### Tabel `invites` di database:
```
id, email, token, full_name, system_role, worker_type, invited_by, status, invited_at, accepted_at, expires_at
```

### Tabel `profiles` di database:
- `invited_by` di tabel `invites` adalah FK ke `profiles.id`
- `profiles` punya kolom `full_name` dan `email`

---

## Step 1 — Buat fungsi `sendInviteEmail`

Buat file **baru**: `lib/email/send-invite.ts`

```typescript
import { resend, FROM_ADDRESS } from '@/lib/email/client'
import { buildInviteEmail } from '@/lib/email/templates/invite'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export interface SendInviteEmailParams {
  toEmail: string
  recipientName: string | null
  inviterName: string
  token: string
  expiresAt: string // ISO string
}

/**
 * Fire-and-forget invite email. Errors are logged but NOT rethrown —
 * the invite is already saved to DB at this point and must not be rolled back.
 */
export async function sendInviteEmail(params: SendInviteEmailParams): Promise<void> {
  const inviteUrl = `${APP_URL}/onboarding/${params.token}`

  const { subject, html } = buildInviteEmail({
    recipientName: params.recipientName,
    inviterName: params.inviterName,
    inviteUrl,
    expiresAt: params.expiresAt,
  })

  try {
    const { error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: params.toEmail,
      subject,
      html,
    })

    if (error) {
      console.error('[sendInviteEmail] Resend error:', error)
    }
  } catch (err) {
    console.error('[sendInviteEmail] Unexpected error:', err)
  }
}
```

**Aturan ketat:**
- Fungsi ini `async` tapi pemanggil **tidak perlu** `await` — boleh fire-and-forget
- Error dari Resend hanya di-log, tidak di-throw
- URL onboarding dibangun dari `NEXT_PUBLIC_APP_URL` + `/onboarding/` + token

---

## Step 2 — Modifikasi `lib/invites/actions.ts`

Baca file `lib/invites/actions.ts` terlebih dahulu. Modifikasi **hanya** fungsi `createInvite`.

### Perubahan yang diperlukan:

**1. Tambah import di bagian atas:**
```typescript
import { sendInviteEmail } from '@/lib/email/send-invite'
```

**2. Modifikasi fungsi `createInvite` — setelah insert berhasil:**

Temukan blok ini (sekitar baris 39–54):
```typescript
  const { data, error } = await admin
    .from('invites')
    .insert({
      email,
      full_name,
      system_role,
      worker_type,
      invited_by: user.id,
    })
    .select('token')
    .single()

  if (error) return { error: error.message }

  revalidatePath('/team')
  redirect(`/team?invited=${data.token}`)
```

Ganti menjadi:
```typescript
  const { data, error } = await admin
    .from('invites')
    .insert({
      email,
      full_name,
      system_role,
      worker_type,
      invited_by: user.id,
    })
    .select('token, expires_at')
    .single()

  if (error) return { error: error.message }

  // Look up inviter's name for the email
  const { data: inviterProfile } = await admin
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const inviterName = inviterProfile?.full_name ?? 'Tim ReKa'

  // Fire-and-forget — do not await, do not block redirect on email failure
  void sendInviteEmail({
    toEmail: email,
    recipientName: full_name,
    inviterName,
    token: data.token as string,
    expiresAt: data.expires_at as string,
  })

  revalidatePath('/team')
  redirect(`/team?invited=${data.token}`)
```

**Aturan ketat:**
- Gunakan `void` untuk fire-and-forget — jangan `await`
- Jangan hapus `redirect()` — flow tetap sama
- Jangan ubah validasi, duplikat check, atau RLS check di atas
- `expires_at` harus diambil dari `.select('token, expires_at')` — bukan hardcode

---

## Step 3 — Update UI Feedback di InviteForm (minor)

Baca file `components/modules/team/InviteForm.tsx`.

Temukan teks konfirmasi di `app/(protected)/team/page.tsx` (baris sekitar 439):
```tsx
<span style={{ fontSize: '0.8125rem', color: 'var(--color-info)', fontWeight: 500 }}>
  Invite created. Copy the link below and share it with the invited person.
</span>
```

Ganti teks menjadi:
```tsx
<span style={{ fontSize: '0.8125rem', color: 'var(--color-info)', fontWeight: 500 }}>
  Undangan terkirim ke email. Link di bawah tersedia sebagai backup jika email tidak masuk.
</span>
```

**Jangan ubah** hal lain di file ini — hanya teks string tersebut.

---

## Step 4 — Verifikasi TypeScript

```bash
npx tsc --noEmit
```

Tidak boleh ada error baru.

---

## Verifikasi End-to-End

1. Jalankan dev server: `npm run dev`
2. Login sebagai **Technical Director**
3. Buka `/team/invite`
4. Isi form dengan email valid yang bisa kamu akses
5. Submit → harus redirect ke `/team?invited=...`
6. Banner konfirmasi harus muncul dengan teks baru
7. Cek inbox email — undangan harus masuk dalam beberapa detik
8. Klik link di email → harus membuka halaman `/onboarding/[token]`
9. Lengkapi form onboarding → harus bisa login setelahnya
10. Kembali ke `/team` → invite harus berubah status ke `accepted`

### Test fallback (email bounced):
11. Matikan `RESEND_API_KEY` sementara di `.env.local` (set ke string kosong)
12. Buat invite baru → harus **tetap redirect sukses** meski email gagal
13. Console harus menampilkan `[sendInviteEmail] Resend error: ...` tapi tidak crash
14. Kembalikan `RESEND_API_KEY` yang benar

---

## Struktur File Setelah Stage 6b

```
lib/
  email/
    client.ts                    ← tidak berubah
    send-invite.ts               ← BARU
    templates/
      invite.ts                  ← tidak berubah
      notification.ts            ← tidak berubah
  invites/
    actions.ts                   ← DIMODIFIKASI (createInvite saja)
    queries.ts                   ← tidak berubah
app/(protected)/team/
  page.tsx                       ← DIMODIFIKASI (1 string teks saja)
```

---

## Yang TIDAK dilakukan di stage ini

- ❌ Notifikasi email — itu Stage 6c
- ❌ Perubahan database / migration
- ❌ Perubahan ke halaman onboarding
- ❌ Hapus CopyLinkButton — tetap ada
