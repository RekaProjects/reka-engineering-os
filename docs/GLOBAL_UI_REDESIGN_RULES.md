# GLOBAL_UI_REDESIGN_RULES.md

## Purpose
These rules apply to **all UI/UX redesign stages** for Agency OS.

Agency OS is an **internal operating system for an engineering agency**.  
It is **not**:
- a marketing site
- a startup landing page
- a generic admin template
- a flashy BI playground

It **must** feel:
- premium
- calm
- professional
- enterprise-like
- desktop-first
- operational
- high-signal / low-noise
- highly scannable for daily management

---

## Non-Negotiable Rules
1. Do **not** add new product features unless a stage explicitly allows a low-risk read-only support query for dashboard presentation.
2. Do **not** redesign business logic.
3. Do **not** redesign architecture unless absolutely necessary for UI composition.
4. Do **not** touch pages or modules outside the current approved stage.
5. Preserve all working flows, existing routes, current entities, and current data relationships.
6. Work in safe, reviewable stages only.
7. Stop after each stage and provide a completion report.
8. Do **not** continue to the next stage unless explicitly approved.
9. Prefer safe iterative UI improvement over risky rewrites.
10. The final result must be more like a premium internal project-management / operations product, not a dribbble shot.

---

## Approved Palette
Use only these brand colors:

- **Carbon Black** `#1D1F1E`
- **Porcelain** `#FFFDF7`
- **Dark Wine** `#851E1E`
- **Twilight Indigo** `#142D50`
- **Graphite** `#454040`
- **Parchment** `#F4F3EE`

### Color Mapping Rules
- **Twilight Indigo** = primary actions, active nav, charts, major structure, important emphasis
- **Dark Wine** = overdue, blocked, revision, urgent, destructive only
- **Carbon Black** = dark surfaces, strong text, brand anchors
- **Graphite** = secondary text, support structure, dividers
- **Porcelain / Parchment** = surfaces and page backgrounds

---

## Forbidden
Do **not** use:
- gradients
- glassmorphism
- neon colors
- noisy startup visuals
- rainbow charts
- pie charts
- donut charts
- radial charts
- decorative widgets
- gimmicky animations

---

## Typography
- Use **Inter**
- Improve visual hierarchy
- Improve readability and information density
- Avoid weak or tiny text
- Ensure page titles, section titles, KPI values, table headers, labels, helper text, and meta text all have clear hierarchy

---

## Product Areas
The redesign applies to these modules:

- dashboard
- clients
- intakes
- projects
- tasks
- deliverables
- files
- team / freelancers
- compensation
- payments
- settings / master data

Supported roles:
- admin / owner
- coordinator
- reviewer
- member / freelancer

---

## Reference Direction
Use the structural strengths of these references, **not literal copying**:

1. **Phoenix project management dashboard**  
   https://prium.github.io/phoenix-tailwind/v1.1.0/dashboard/project-management.html

   Adapt:
   - strong dashboard composition
   - summary + operational detail balance
   - clearer project visibility
   - stronger activity/task/project grouping

2. **Dash UI admin dashboard**  
   https://dash-ui-admin-template.vercel.app/

   Adapt:
   - scanability
   - strong KPI strip
   - clear sectional breakdown
   - clean admin/product layout rhythm

### Important Reference Rule
Do **not** clone these references visually 1:1.  
Do **not** recreate their branding or exact layout.  
Instead, adapt their strongest structural ideas into **Agency OS**, using the approved Agency OS palette and enterprise engineering-agency tone.

---

## Delivery Rule
For every stage:
- inspect first if requested
- implement only the approved scope
- provide a completion report
- include exact files modified
- include QA checklist
- include remaining work for the next stage
