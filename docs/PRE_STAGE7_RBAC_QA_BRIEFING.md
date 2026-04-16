# Pre-Stage-7 Briefing — RBAC QA Pass

## Purpose

RBAC implementation is already materially improved.
This pass exists to **prove it behaves correctly in practice** and to fix any remaining alignment or leakage issues before deployment hardening.

This is not a big auth rewrite.
This is not a feature pass.
This is a **QA + alignment + consistency pass**.

## Roles
- admin / owner
- coordinator
- reviewer
- member / freelancer

## What must be validated

### 1. Surface behavior
Check that nav, routes, pages, and action buttons are consistent with the approved role matrix.

### 2. Server behavior
Check that restricted actions are actually blocked even if the UI is bypassed.

### 3. Partial-edit alignment
Check that reviewer/member forms do not imply broader edit rights than the server actually allows.

### 4. Scoped visibility
Check that each role sees the right projects/tasks/deliverables/files/payments in practice.

### 5. Access-denied behavior
Check that forbidden routes and surfaces behave intentionally and clearly.

## Manual QA expectations by role

### Admin
Should be able to perform full intended operations.

### Coordinator
Should only operate in assigned scope.
Should not get global create/edit privileges where not intended.

### Reviewer
Should only edit review-related fields.
Should not edit core metadata.

### Member / Freelancer
Should only see personal scope.
Should only edit allowed partial fields.
Should not create global records.

## What not to do
- do not redesign UI broadly
- do not build a giant enterprise RBAC framework
- do not add features
- do not refactor auth architecture unnecessarily

## Deliverable
At the end of this pass, there should be no obvious practical role leakage left before deployment hardening.
