# Pre-Stage-7 Briefing — UI Completeness Pass

## Purpose

This pass exists to close the remaining design-system gap before deployment hardening.

This is **not** a major redesign pass.
This is **not** a feature expansion pass.
This is a **finish-line consistency pass**.

## What must be checked and completed

### 1. List pages
Confirm all remaining list pages that are supposed to use the shared system actually do so.

Target pattern:
- `PageHeader`
- shared `FilterBar`
- shared `DataTable`
- consistent empty-state behavior
- consistent action placement
- consistent row rhythm and hover behavior

Pages to inspect:
- clients
- intakes
- projects
- tasks
- deliverables
- files
- team
- compensation
- payments
- search results / operational list pages where relevant

### 2. Detail pages
Confirm all relevant detail pages have the intended structure and that the shared status hero pattern is applied consistently where appropriate.

Target pattern:
- `PageHeader`
- breadcrumb or contextual back-link where already supported
- `EntityStatusStrip` where appropriate
- clean section rhythm
- consistent action placement
- consistent empty-state behavior inside tabs or related-data sections

Pages to inspect:
- project detail
- task detail
- deliverable detail
- payment detail
- team member detail
- client detail
- intake detail
- file detail
- compensation detail

### 3. Forms
Confirm all remaining forms use the shared section pattern and do not rely on old local section-title styles.

Target pattern:
- `FormSection`
- consistent field rhythm
- consistent helper text
- consistent error treatment
- consistent submit/cancel hierarchy

Forms to inspect:
- ProjectForm
- TaskForm
- DeliverableForm
- PaymentForm
- CompensationForm
- IntakeForm
- ClientForm
- FileForm
- TeamMemberForm
- InviteForm
- Activate / onboarding forms
- conversion forms
- settings forms

### 4. Badges
Confirm module-specific badges no longer drift visually from the shared badge primitive.

Check:
- font size
- padding
- radius
- weight
- semantic color discipline

### 5. Empty states
Confirm the product distinguishes correctly between:
- first-use / no-record-yet states
- no-results / filtered-empty states

## What not to do
- do not redesign the whole product again
- do not redesign the dashboard broadly again
- do not add features
- do not change business logic
- do not refactor architecture unnecessarily

## Deliverable
At the end of this pass, the product should feel like one coherent UI system, not a mix of polished and semi-old pages.
