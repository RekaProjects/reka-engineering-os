# Final Manual QA Matrix by Role

## Admin / Owner
Should be able to:
- see all major modules
- create/edit/delete clients
- create/edit/delete intakes
- create/edit/delete projects
- create/edit/delete tasks
- create/edit/delete deliverables
- manage files
- manage team / invites
- manage compensation / payments
- access settings / master data

## Coordinator
Should be able to:
- see operational modules within intended scope
- manage tasks/deliverables/files within assigned project scope
- edit scoped projects if intended
- not create global projects if project creation is admin-only
- not manage settings
- not mutate compensation/payments unless explicitly allowed

## Reviewer
Should be able to:
- see review-relevant projects/tasks/deliverables
- update review-related fields only
- not edit structural metadata
- not create projects/tasks globally
- not mutate payments/compensation/settings

## Member / Freelancer
Should be able to:
- see only assigned or otherwise intended personal-scope work
- update own execution/submission fields where intended
- view own payments
- not create global projects/tasks/deliverables/files unless explicitly allowed
- not access settings/team admin/financial admin areas

## CTA sweep checklist
Check these surfaces:
- dashboard quick actions
- page header actions
- empty state primary buttons
- section card secondary actions
- project hub buttons
- tab-level CTAs
- detail-page edit buttons
- list-page create buttons
- quick links / side panels
