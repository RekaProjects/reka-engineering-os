# STAGE_03_BRIEFING_DASHBOARD_REDESIGN.md

## Stage Name
Stage 03 — Dashboard Redesign (Owner/Admin Control Center)

## Goal
Turn the dashboard into a premium owner/admin control center for an engineering agency.

This stage must make the dashboard feel significantly closer to the structural quality of the reference project-management dashboards, while preserving Agency OS branding and product logic.

---

## Why the Dashboard Is Critical
For the owner/admin, the dashboard must answer in 5 seconds:
- how many active projects exist
- what is overdue
- what is blocked
- what is in revision
- what is due soon
- what is waiting on review
- what is waiting on client
- who is overloaded
- what the payment situation looks like
- what changed recently

The dashboard must stop feeling like:
- a few weak KPI cards
- random tables inside cards
- large empty white zones
- polite panels with little urgency

It must become:
- a true command center
- high-signal / low-noise
- visually intentional
- operationally useful

---

## Required Dashboard Structure
### A. Header Area
Keep:
- page title
- operational subtitle

Optional:
- compact status line if useful, such as:
  - “3 items need attention”
  - or “No critical blockers today”

### B. KPI Summary Row
Use a stronger KPI strip with more visual weight.

Prioritized KPIs:
- Active Projects
- Open Tasks or Overdue Tasks
- Due This Week
- Awaiting Review
- Waiting on Client
- In Revision
- Payment Exposure if practical and low-risk

Requirements:
- stronger hierarchy
- larger values
- more substantial cards
- better icon treatment
- meaningful subtext where appropriate
- no weak flat mini-cards

### C. Main Overview Row
#### Left — Operational Health
Must be visual.

Preferred:
- horizontal stacked bar or grouped bar
- show task flow:
  - to do
  - in progress
  - review
  - revision
  - blocked
  - done

Purpose:
- show where work is flowing or getting stuck

#### Right — Deadline Pressure
Must be more visual than a dead table.

Preferred:
- bucketed summary for next 7–14 days
- compact bar-based or grouped summary
- highly scannable

Purpose:
- show upcoming delivery pressure fast

### D. Action / Risk Row
#### Left — Needs Attention
Must become a unified ranked alert queue.

Do not keep three mini tables.

Include:
- blocked
- overdue
- revision
- client waiting
- other important operational risks if available

#### Right — Payment Snapshot
Keep concise and operational.

Possible signals:
- unpaid
- partial
- paid
- outstanding amount

Do not turn this into a finance dashboard.

### E. People / Activity Row
#### Left — Team Workload
Must become visual.

Preferred:
- horizontal bars per team member
- show load clearly
- make overload obvious

#### Right — Recent Activity
Must feel tighter and more intentional.

Do not leave it as a lonely filler panel.

---

## Chart Rules
Allowed:
- horizontal bar chart
- stacked bar chart
- simple bar chart
- line chart only if clearly useful

Forbidden:
- pie
- donut
- radial
- flashy analytics widgets
- rainbow chart colors

Use:
- Twilight Indigo as main chart structure
- Dark Wine only for actual risk
- neutral tones for the rest

---

## Low-Data Rules
If data is sparse:
- no giant empty blocks
- no dead half-width whitespace
- use refined fallback states
- keep layout intentional
- cards must still preserve their role in the page

---

## Role-Based Dashboard Rules
### Admin / Owner
- richest dashboard
- strongest overview
- business + operational signal

### Coordinator
- lighter than admin
- deadline + assignment emphasis

### Reviewer
- leaner
- review-focused

### Member / Freelancer
- simpler
- focused on my work, my deliverables, my tasks, my payments
- must not feel like a broken admin dashboard

---

## Query / Data Discipline
Claude may add low-risk read-only dashboard presentation support if needed.

Possible additions:
- task status counts
- deadline buckets
- payment snapshot aggregates

Do not:
- rewrite backend logic
- add unrelated data features
- add overengineered analytics

---

## References to Adapt
### Phoenix Project Management Dashboard
https://prium.github.io/phoenix-tailwind/v1.1.0/dashboard/project-management.html

Use for:
- dashboard storytelling
- project-management composition
- summary + activity + project visibility balance

### Dash UI
https://dash-ui-admin-template.vercel.app/

Use for:
- KPI clarity
- clean admin/product composition
- scanability

Do not copy these literally.

---

## Required Output
Before coding, Claude must provide:
1. exact files/folders to modify
2. restatement of final dashboard section structure
3. charts / visual summaries to add
4. low-data strategy
5. admin vs scoped-role differences
6. highest regression risk

After implementation, Claude must stop and report:
- files modified
- dashboard layout changes
- charts/visual summaries added
- fallback states added
- new queries added if any
- role-specific dashboard changes
- local QA checklist
- what Stage 04 should do
