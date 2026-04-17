# Pre-Stage-7 Master 6-Stage Briefing

## Objective
Before Stage 7 deploy readiness, close the final **must-fix** gaps in a strict 6-stage sequence.

This sequence combines:
1. final security / workflow hardening
2. final role QA cleanup
3. finance automation lite

## Non-negotiable rules
- Do not add new product features outside this scope
- Do not redesign UI broadly
- Do not redesign architecture broadly
- Do not turn the finance flow into payroll / tax / invoicing software
- Preserve all working flows
- Work in narrow, reviewable stages
- Stop after each stage and provide a completion report

## The 6 stages

### Stage 01 — RLS parity
Goal:
Align database-level protections to the app permission model as practically as possible before deploy.

### Stage 02 — Minimal status transition rules
Goal:
Add practical workflow discipline so status changes are not too permissive by role.

### Stage 03 — CTA leak cleanup + final role QA
Goal:
Remove unauthorized create/edit CTAs everywhere and verify the manual role matrix end-to-end.

### Stage 04 — Finance automation lite audit + plan
Goal:
Inspect the current compensation/payment workflow and choose the safest automation-lite direction.

### Stage 05 — Finance automation lite implementation
Goal:
Implement the approved low-risk automation-lite layer.

### Stage 06 — Finance automation lite QA sweep
Goal:
Verify the automation-lite workflow is correct, role-safe, and deploy-ready.

## Stage 7 comes after this
Only after all 6 stages are clean:
- env vars
- migrations
- preview deploy
- production hardening
- production rollout
