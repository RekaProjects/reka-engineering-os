# Stage 01 Briefing — Foundation, Auth, App Shell, Design System

## Stage goal
Build the foundation of the app so all later modules can be added cleanly and consistently.

This stage is about:
- architecture
- auth
- global layout
- UI system
- database baseline
- route protection
- reusable foundations

This stage is not about full business modules yet.

## Mission
Create a production-grade starting point for an internal engineering agency control app using:
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- Supabase Auth
- Supabase Postgres
- Row Level Security
- Vercel-friendly architecture

## In-scope deliverables
1. Project structure
2. Auth flow
3. Protected app shell
4. Sidebar + topbar
5. Design tokens and color system
6. Reusable layout primitives
7. Reusable status badge component
8. Empty state and table shell components
9. Initial DB schema for users and shared enums/constants
10. Seed-ready placeholders or example data strategy
11. Settings/constants file for statuses, priorities, disciplines, sources

## Out of scope
Do not build:
- clients CRUD
- intake CRUD
- projects module
- tasks module
- deliverables module
- Drive integration
- dashboard analytics
- heavy charts
- notifications

## Technical requirements
### App structure
Use clear modular folder organization.

Suggested:
- `app/(auth)/...`
- `app/(app)/dashboard`
- `app/(app)/clients`
- `app/(app)/intakes`
- `app/(app)/projects`
- `app/(app)/tasks`
- `app/(app)/deliverables`
- `components/layout`
- `components/shared`
- `components/ui`
- `lib/supabase`
- `lib/auth`
- `lib/constants`
- `lib/utils`
- `types`

### Auth
Implement:
- login page
- optional basic sign up flow if appropriate, otherwise sign-in only with seeded user assumption
- session-aware route protection
- redirect unauthenticated users to login
- redirect authenticated users away from auth page to dashboard

### App shell
Create:
- left sidebar
- top bar
- page container
- responsive-but-desktop-first structure
- active nav highlighting
- user menu placeholder

Sidebar items:
- Dashboard
- Clients
- Intakes
- Projects
- Tasks
- Deliverables
- Team
- Settings

Pages may be placeholder pages in this stage, but they must exist with proper layout and empty states.

## UI/UX requirements
### Overall aesthetic
- calm and professional
- light theme only for now
- white surfaces, soft borders, restrained shadows
- information density balanced, not sparse, not crowded
- no decorative illustrations unless they are extremely subtle
- no neon or glossy UI
- no oversaturated gradient usage

### Layout rules
- use a max width container for comfort on very wide screens
- standard page spacing throughout
- page headers consistent
- sidebar width consistent
- top bar slim and clean

### Components to build now
1. AppSidebar
2. AppTopbar
3. PageHeader
4. KPI card shell
5. DataTable shell
6. EmptyState
7. SearchInput
8. FilterBar shell
9. StatusBadge
10. PriorityBadge
11. SectionCard
12. QuickActionButton

### Status badge requirements
Support reusable variants for:
- neutral
- in progress
- review
- success
- danger

### Typography
- small but readable default text
- clear weight hierarchy
- headings compact and crisp

## Design tokens
Use this palette exactly unless there is a compelling accessibility reason to tweak shades:
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Surface subtle: `#F1F5F9`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#475569`
- Text muted: `#64748B`
- Primary: `#1D4ED8`
- Primary hover: `#1E40AF`
- Primary subtle: `#DBEAFE`
- Warning: `#D97706`
- Success: `#16A34A`
- Danger: `#DC2626`
- Neutral: `#94A3B8`

## Data / schema requirements
Prepare the base for future stages.
At minimum include:
- `profiles` or `users` table linked to Supabase auth users
- enums/constants for:
  - disciplines
  - source platforms
  - project priorities
  - intake statuses
  - project statuses
  - task statuses
  - deliverable statuses
  - team roles

The schema may be partial here, but structure it to support later stages cleanly.

## Route and page requirements
Create placeholder pages with page headers and empty states for:
- dashboard
- clients
- intakes
- projects
- tasks
- deliverables
- team
- settings

Each page should feel intentional, not like a blank route.

## Accessibility requirements
- proper contrast
- keyboard-friendly nav basics
- clear focus states
- aria labels where appropriate
- icon buttons must have text labels or accessible labels

## Code quality requirements
- TypeScript strictness where practical
- reusable components
- avoid duplicated hard-coded colors
- avoid deeply nested giant page files
- centralize constants
- clean naming
- comments only where useful, not noise

## Testing / validation
At minimum:
- auth redirect behavior works
- sidebar navigation works
- placeholder routes render inside protected shell
- layout does not break on common laptop widths
- color/status badges render consistently

## Required final output from AI for this stage
1. summary of completed work
2. file tree or changed-file list
3. migration files created
4. setup notes
5. known limitations
6. exact manual test steps
7. recommendation for Stage 02 readiness

## Definition of done
This stage is done when:
- the app can be opened
- auth works
- the protected shell works
- the visual system is established
- placeholder modules exist
- the codebase is ready for real module implementation
