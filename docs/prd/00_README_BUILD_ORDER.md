# Engineering Agency App — AI Build Pack

This pack is designed for **Antigravity** and **Claude** to build an internal web app for an engineering agency that handles:
- client intake from Upwork, Fiverr, and direct leads
- project creation and control
- task assignment to staff
- deliverables and revisions
- Google Drive-linked file management
- dashboard-based operational monitoring

## Recommended build order
Work **strictly by stage**. Do not skip ahead. Do not merge future-stage features into earlier stages unless explicitly required for technical compatibility.

1. `01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `STAGE_01_BRIEFING_FOUNDATION_DESIGN_SYSTEM.md`
3. `STAGE_01_PROMPT_ANTIGRAVITY_CLAUDE.md`
4. `STAGE_02_BRIEFING_CLIENTS_INTAKES.md`
5. `STAGE_02_PROMPT_ANTIGRAVITY_CLAUDE.md`
6. `STAGE_03_BRIEFING_PROJECTS_TEAM_ASSIGNMENT.md`
7. `STAGE_03_PROMPT_ANTIGRAVITY_CLAUDE.md`
8. `STAGE_04_BRIEFING_TASKS_DELIVERABLES_FILES.md`
9. `STAGE_04_PROMPT_ANTIGRAVITY_CLAUDE.md`
10. `STAGE_05_BRIEFING_DASHBOARD_SEARCH_ACTIVITY.md`
11. `STAGE_05_PROMPT_ANTIGRAVITY_CLAUDE.md`
12. `STAGE_06_BRIEFING_POLISH_QA_HANDOFF.md`
13. `STAGE_06_PROMPT_ANTIGRAVITY_CLAUDE.md`

## Mandatory operating rules for AI
- Follow the stage file exactly.
- Build only the requested scope for the active stage.
- Preserve existing architecture and naming consistency.
- Prefer **clean, simple, dense-but-readable UI** over decorative UI.
- Prefer **table-first operational UX** over marketing-style card layouts.
- Do not introduce extra libraries unless there is a clear, direct need.
- Do not redesign the color system beyond the defined palette.
- Do not invent modules that are out of scope.
- Every stage must end with:
  1. a summary of what was built
  2. list of changed files
  3. known issues / limitations
  4. manual test checklist
  5. next recommended step

## Product vision in one sentence
Build a **desktop-first internal control app** for a mechanical and civil engineering agency so the owner can track clients, intakes, projects, assignments, deadlines, deliverables, revisions, and linked Google Drive files in one operational dashboard.

## Technical baseline
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- Recharts
- Supabase Postgres
- Supabase Auth
- Row Level Security
- Vercel deployment
- Google Drive integration for file storage
- Google Picker for selecting / attaching Drive files
- Supabase stores metadata; Google Drive stores actual working files

## UX baseline
- desktop-first
- calm, professional, highly scannable
- neutral/light theme by default
- sidebar + topbar layout
- summary cards only where useful
- tables for operational data
- drawers/modals for quick create/edit
- tabs for detail pages
- status badges with strict color consistency

## Suggested color system
Use a restrained professional palette.

### Core neutrals
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Surface subtle: `#F1F5F9`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#475569`
- Text muted: `#64748B`

### Accent
- Primary: `#1D4ED8`
- Primary hover: `#1E40AF`
- Primary subtle background: `#DBEAFE`

### Status colors
- New / Draft / Neutral: `#94A3B8`
- Ongoing / In Progress: `#2563EB`
- Review / Waiting / Pending: `#D97706`
- Completed / Approved: `#16A34A`
- Overdue / Blocked / Urgent: `#DC2626`

### UX note
Do not use highly saturated gradients, glowing effects, glassmorphism, neon accents, or oversized hero sections. This is an operations product, not a landing page.

## Typography and spacing
- Use a clean sans-serif stack
- 14px–15px base body text
- 12px helper text only when needed
- 20px–24px section titles
- generous vertical rhythm
- dense tables, but never cramped
- cards with soft shadow or border only, not both overly strong

## Output expectation for the AI
The AI should produce working code, migrations, reusable UI components, and concise documentation. It should not just write plans.
