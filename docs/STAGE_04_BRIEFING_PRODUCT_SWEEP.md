# STAGE_04_BRIEFING_PRODUCT_SWEEP.md

## Stage Name
Stage 04 — Product Sweep (List Pages + Detail Pages + Forms + Settings + Role Polish)

## Goal
Complete the premium UI/UX redesign across the rest of the product so the entire app feels like one coherent, mature, high-quality internal operating system.

This stage should make the rest of the product catch up to the visual/system quality established in Stage 02 and Stage 03.

---

## Stage 04 Scope
Only redesign/refine:

1. List pages
   - clients
   - intakes
   - projects
   - tasks
   - deliverables
   - files
   - team
   - compensation
   - payments
   - search results if relevant

2. Detail pages
   - project detail
   - task detail
   - deliverable detail
   - payment detail
   - team member detail
   - client detail
   - intake detail
   - file detail
   - compensation detail

3. Forms
   - project form
   - task form
   - deliverable form
   - intake form
   - client form
   - file form
   - payment form
   - compensation form
   - invite form
   - onboarding / activate form
   - conversion forms
   - settings forms

4. Settings / master data UI
5. Empty-state consistency
6. Role-based page polish
7. Final consistency sweep

---

## List Page Expectations
List pages must feel stronger and more premium.

Required improvements:
- stronger page structure
- more intentional action button placement
- tighter filter-bar rhythm
- more premium tables
- better scanability
- clearer primary vs secondary information hierarchy
- stronger status / progress / meta treatment
- better row hover behavior
- better low-data states
- less “table dropped into page” feeling

List pages should feel closer to mature internal software rather than generic CRUD pages.

---

## Detail Page Expectations
Detail pages should feel like workspaces, not random metadata dumps.

Required improvements:
- stronger summary area
- better grouping of metadata
- clearer related sections
- better action hierarchy
- cleaner notes / activity / file presentation where relevant
- stronger section hierarchy
- more premium content rhythm
- clearer relationship between summary, status, related entities, and actions

---

## Form Expectations
Forms must become:
- cleaner
- more efficient
- better grouped
- better spaced
- more premium
- more serious

Required improvements:
- better section grouping
- stronger field rhythm
- clearer labels and helper text
- better inline validation visuals
- better error styling
- stronger submit/cancel hierarchy
- more intentional action placement

The forms should feel like part of a mature operating system, not default UI library forms.

---

## Settings / Master Data Expectations
Settings must feel like a serious admin/configuration surface.

Improve:
- tabs
- domain sections
- tables
- state indicators
- add/edit flows
- option management interactions

---

## Empty States
Unify empty states across the product:
- better icon treatment
- better spacing
- better CTA placement
- better density
- avoid giant empty zones
- premium and intentional low-data feel

---

## Role-Based UX Polish
### Admin / Owner
- richest control surfaces
- strongest overview
- broadest visibility

### Coordinator
- operationally strong but lighter than admin

### Reviewer
- leaner, review-centered

### Member / Freelancer
- simpler, cleaner, focused on my work
- must not feel like a crippled admin panel

---

## References to Adapt
### Phoenix
https://prium.github.io/phoenix-tailwind/v1.1.0/dashboard/project-management.html

Use for:
- project-management workspace feel
- clearer project/task presentation
- stronger summary + detail structure

### Dash UI
https://dash-ui-admin-template.vercel.app/

Use for:
- clarity
- admin/product rhythm
- clean sectional layout
- readable list/table hierarchy

Do not copy either literally.

---

## Strict Rules
- do not rebuild the app from scratch
- do not redesign architecture
- do not add unrelated features
- do not revisit Stage 02 or Stage 03 broadly unless a tiny consistency fix is required
- extend the system already created
- remove remaining template-like surfaces
- make the product feel fully unified

---

## Required Output
Before coding, Claude must provide:
1. exact files/folders to modify
2. restatement of Stage 04 scope
3. how list pages will improve
4. how detail pages will improve
5. how forms will improve
6. how settings will improve
7. highest regression risk and preservation strategy

After implementation, Claude must stop and report:
- files modified
- list page changes
- detail page changes
- form changes
- settings changes
- empty-state changes
- role-based UI changes
- final consistency improvements
- local QA checklist
- any remaining UI debt
