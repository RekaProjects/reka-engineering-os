# STAGE_02_BRIEFING_GLOBAL_SHELL_SHARED_SYSTEM.md

## Stage Name
Stage 02 — Global Shell + Shared Design System Foundation

## Goal
Build the visual foundation of Agency OS so the product starts to feel like one premium, coherent internal operating system.

This stage creates the base system that all later pages should inherit.

---

## Stage 02 Scope
Only redesign/refine:

1. Global shell
   - sidebar
   - topbar
   - page container rhythm
   - page header hierarchy

2. Shared primitives
   - KpiCard
   - SectionCard
   - DataTable
   - StatusBadge
   - PriorityBadge
   - module badge styling baseline
   - EmptyState
   - SearchInput
   - Filter controls
   - Buttons
   - Banners / alerts

3. Empty-state baseline
4. Control sizing baseline
5. Shared spacing / visual rhythm baseline

---

## Why This Stage Matters
If the global shell and shared system are weak:
- dashboard will still feel weak
- list pages will still feel template-like
- detail pages will still feel random
- forms will still feel inconsistent

This stage should make the product feel:
- less generic
- more branded
- more premium
- more intentional
- more unified

---

## Design Expectations
### Sidebar
The sidebar must become:
- dark Carbon Black
- premium
- enterprise-like
- cleanly grouped
- easy to scan
- stronger in identity

It should feel more like the anchor of a serious operations product and less like a generic admin nav.

Required improvements:
- stronger brand area
- clearer section grouping
- better icon/label hierarchy
- better active state
- better relationship between section labels and nav items
- more intentional density

### Topbar
The topbar must become:
- cleaner
- more integrated
- more premium
- better spaced

The search should feel like part of the app system, not a floating default control.

### Page Shell
Page containers and spacing must be improved:
- better use of width
- fewer dead zones
- more consistent section rhythm
- stronger content hierarchy

### Page Headers
Page headers must become stronger:
- better title scale
- clearer subtitle style
- more intentional placement of actions
- more consistency across modules

---

## Shared Primitives Expectations
### KPI Cards
- stronger visual weight
- clearer value hierarchy
- better icon treatment
- more premium feel
- more consistent internal spacing

### Section Cards
- more deliberate card rhythm
- stronger header/body relationship
- better internal spacing
- less template-like

### Tables
- better header hierarchy
- better row readability
- more premium density
- better meta-text treatment
- more controlled hover behavior

### Badges
- unified shape, spacing, and hierarchy
- consistent use of Indigo / Wine / neutrals
- cleaner module badge system

### Empty States
- more intentional
- more premium
- better CTA placement
- less giant blank space feeling

### Buttons and Controls
- stronger hierarchy
- more mature spacing
- consistent control height / radius
- primary vs secondary actions clearly differentiated

---

## Stage 02 Must Not Do
Do not:
- redesign the entire dashboard structure yet
- sweep all list pages yet
- sweep all detail pages yet
- sweep all forms yet
- add unrelated features
- redesign logic or architecture

Only build the shared visual foundation.

---

## References to Adapt
### Phoenix
https://prium.github.io/phoenix-tailwind/v1.1.0/dashboard/project-management.html

Use for:
- cleaner shell rhythm
- better dashboard grammar influence
- more mature product feel

### Dash UI
https://dash-ui-admin-template.vercel.app/

Use for:
- clean admin/product spacing
- clarity of hierarchy
- readable component rhythm

Do not clone either reference literally.

---

## Required Output
Before coding, Claude must provide:
1. exact files/folders to modify
2. clear restatement of Stage 02 scope
3. shared components to update
4. highest regression risk
5. preservation strategy

After implementation, Claude must stop and report:
- files modified
- sidebar changes
- topbar changes
- page shell changes
- shared component changes
- empty-state baseline changes
- local QA checklist
- what Stage 03 should do
