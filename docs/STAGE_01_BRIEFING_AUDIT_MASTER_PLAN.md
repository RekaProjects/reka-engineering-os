# STAGE_01_BRIEFING_AUDIT_MASTER_PLAN.md

## Stage Name
Stage 01 — Audit + Master UI/UX Redesign Plan

## Goal
Before writing any code, inspect the current Agency OS product and produce a disciplined redesign plan for the **entire UI/UX system**.

This stage exists to prevent uncontrolled redesign and to force a thoughtful, structured plan.

---

## Product Context
Agency OS is an internal operating system for an engineering agency.

Primary modules:
- Dashboard
- Clients
- Intakes
- Projects
- Tasks
- Deliverables
- Files
- Team / Freelancers
- Compensation
- Payments
- Settings / Master Data

Role-based users:
- Admin / Owner
- Coordinator
- Reviewer
- Member / Freelancer

This product is for:
- daily operations
- project oversight
- assignment management
- deliverable tracking
- payment visibility
- internal coordination

This product is **not** a public-facing website and should not be designed like a marketing site.

---

## What Is Wrong Today
The redesign plan should explicitly diagnose problems such as:
- UI still feels too template-like
- dashboard is not strong enough as an owner/admin control center
- KPI cards are weak
- too many pages feel like “table inside card inside page”
- visual hierarchy is not strong enough
- too much dead space in some areas
- some modules feel more refined than others
- role-based experiences are not intentional enough
- empty states still feel too empty
- overall product does not yet feel like one premium, coherent system

---

## Approved Visual Direction
Use only the approved palette and enterprise tone from the global rules.

### Visual Tone
The redesign must feel:
- premium
- calm
- professional
- enterprise-like
- operational
- restrained
- useful
- high-signal / low-noise

### Not Allowed
- startup gimmicks
- decorative dashboards
- flashy colors
- copy-paste template feel

---

## Reference Websites to Use
These references must be cited and used as directional inspiration:

### 1. Phoenix Project Management Dashboard
https://prium.github.io/phoenix-tailwind/v1.1.0/dashboard/project-management.html

Use it for:
- dashboard composition
- stronger project-management orientation
- summary + detail balance
- tasks/activity/project grouping
- better control-center feeling

### 2. Dash UI Admin Dashboard
https://dash-ui-admin-template.vercel.app/

Use it for:
- clarity
- KPI strip readability
- clean section rhythm
- professional admin/product feel
- scanability

### Rule for References
Do not clone these references literally.
Do not copy exact layout 1:1.
Adapt the strongest principles into Agency OS using the approved Agency OS brand system.

---

## Scope of the Plan
The audit and plan must cover:

1. Global shell
   - sidebar
   - topbar
   - page shell
   - page headers

2. Shared design system
   - KPI cards
   - cards / section cards
   - tables
   - badges
   - buttons
   - filters
   - search inputs
   - alerts / banners
   - empty states

3. Dashboard
   - KPI strip
   - operational health
   - deadline pressure
   - needs attention
   - team workload
   - payment snapshot
   - recent activity
   - low-data behavior

4. List pages
   - clients
   - intakes
   - projects
   - tasks
   - deliverables
   - files
   - team
   - compensation
   - payments

5. Detail pages
   - project detail
   - task detail
   - deliverable detail
   - payment detail
   - team detail
   - client detail
   - intake detail
   - file detail
   - compensation detail

6. Forms
   - create/edit forms
   - invite
   - onboarding
   - conversion flows
   - payment/compensation forms
   - settings forms

7. Role-based experiences
   - admin
   - coordinator
   - reviewer
   - member

---

## Required Output
The Stage 01 response must include:

1. Brutal but constructive UI/UX audit
2. Redesign direction for the whole product
3. Proposed design system direction for:
   - layout
   - sidebar
   - topbar
   - page headers
   - cards
   - KPI cards
   - tables
   - forms
   - badges
   - empty states
   - dashboard
4. Proposed dashboard structure
5. Proposed list-page structure
6. Proposed detail-page structure
7. Proposed form structure
8. Role-based UX strategy
9. Exact files/folders likely to change
10. Safe staged implementation plan
11. Regression risks and mitigation
12. Success criteria

---

## Strict Rules
- Do not write code
- Do not implement
- Do not modify files
- Do not propose new business features
- Focus on structure, hierarchy, usability, and coherence
- Stop after the redesign plan
