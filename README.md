# Engineering Agency OS

An internal operations platform for managing clients, intakes, projects, tasks, and deliverables. Built for desktop, designed to be operational and calm.

## Tech stack

- **Next.js 15** (App Router, server components by default)
- **Supabase** (Auth, Postgres, Row Level Security)
- **TypeScript**
- **Tailwind CSS** + inline `style` objects
- **Lucide React** icons

---

## Prerequisites

- Node.js 18+
- A Supabase project (free tier is fine)
- `npm` or equivalent package manager

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase — get these from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Google OAuth (optional — only needed if Google Drive file linking is used)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/google/callback
GOOGLE_DRIVE_ROOT_FOLDER_ID=
```

**Where to find Supabase keys:**
- Dashboard → Project Settings → API
- `NEXT_PUBLIC_SUPABASE_URL` = Project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` = `anon` / `public` key
- `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (keep this secret)

### 3. Run database migrations

Migrations live in `supabase/migrations/`. Run them in order against your Supabase database. You can use the Supabase CLI (`supabase db push`) or paste them directly into the SQL editor in the Supabase dashboard.

**Migration order:**

| File | Description |
|------|-------------|
| `0001_initial_schema.sql` | Profiles table and base RLS setup |
| `0002_clients.sql` | Clients table |
| `0003_intakes.sql` | Intakes table |
| `0004_projects.sql` | Projects table |
| `0005_project_team_assignments.sql` | Project team membership |
| `0006_fix_profiles_rls_recursion.sql` | RLS policy fix (must run after 0001) |
| `0007_tasks.sql` | Tasks table |
| `0008_deliverables.sql` | Deliverables table |
| `0009_project_files.sql` | Project files / attachments |
| `0010_activity_logs.sql` | Activity log feed (required for dashboard) |

> All migrations are idempotent-safe — safe to re-run if needed.

### 4. Create a user

In your Supabase dashboard, go to **Authentication → Users → Add user**. After creating the user, insert a matching row into the `profiles` table:

```sql
INSERT INTO profiles (id, full_name, email, role, discipline)
VALUES (
  '<user-uuid-from-auth>',
  'Your Name',
  'your@email.com',
  'lead_engineer',   -- or: engineer, project_manager, director, admin
  'civil'            -- or: structural, mechanical, electrical, multidiscipline
);
```

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/auth/login`.

---

## QA flow

After setup, verify the following in order:

1. **Auth** — Log in and log out. Confirm unauthenticated users are redirected to `/auth/login`.
2. **Dashboard** — All 6 KPI cards load (counts may be zero initially). No errors in console.
3. **Clients** — Create a client. Confirm it appears in the list and detail page works.
4. **Intakes** — Create an intake linked to the client. Convert it to a project.
5. **Projects** — Confirm the converted project appears. Open it and verify all tabs: Overview, Team, Tasks, Deliverables, Files, Activity.
6. **Tasks** — Add a task to the project. Update its status. Confirm dashboard KPI updates.
7. **Deliverables** — Add a deliverable. Update status.
8. **Search** — Type in the topbar search or press `/` from any page. Confirm results appear across entity types.
9. **Activity** — Go to a project's Activity tab. Confirm actions logged from steps above appear.

---

## Project structure

```
app/
  (auth)/          Login page
  (protected)/     All authenticated pages (layout with sidebar + topbar)
    dashboard/
    clients/
    intakes/
    projects/
    tasks/
    deliverables/
    files/
    team/
    settings/
    search/

components/
  layout/          AppSidebar, AppTopbar, TopbarSearch, PageHeader
  modules/         Per-entity form and badge components
  shared/          SectionCard, EmptyState, PriorityBadge, ProgressBar, etc.

lib/
  supabase/        Server and browser client helpers
  activity/        Activity log queries and actions
  clients/         Queries and server actions
  intakes/         Queries, server actions, convert action
  projects/        Queries, team queries, server actions
  tasks/           Queries and server actions
  deliverables/    Queries and server actions
  files/           Queries and server actions
  users/           Profile select helper
  dashboard/       KPI and feed queries
  search/          Global search query
  utils/           formatDate, formatters

supabase/
  migrations/      All SQL migrations in numbered order

types/
  database.ts      Full TypeScript types for all tables
```

---

## Notes

- Google Drive integration is wired in the schema (`google_drive_folder_link`, `google_web_view_link`) but the OAuth flow is not implemented. File links can be entered manually.
- The Team page and Settings page are placeholder stubs — team management is handled per-project via the Team tab.
- Activity logging is fire-and-forget: it never breaks a primary operation if it fails.
- All status values in the database are lowercase strings (e.g., `'in_progress'`, `'completed'`). Badge components handle display formatting.
