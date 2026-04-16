# Pre-Stage-7 Master Checklist

This checklist must be treated as the **final readiness gate before deployment hardening**.

## Goal

Before Stage 7, the product must be:
- visually consistent enough to feel complete
- permission-safe enough for internal team/freelancer use
- operationally correct around payments/compensation
- clear enough at the dashboard level for owner/admin use

## Required passes

### Pass 1 — UI Completeness
Finish the design-system finish line across real module pages.

Success targets:
- all remaining list pages use the shared `FilterBar + DataTable` pattern where planned
- all relevant detail pages use `EntityStatusStrip` where appropriate
- all remaining forms use `FormSection`
- all remaining badge implementations are visually aligned with the shared badge primitive
- empty states are consistent enough across the product

### Pass 2 — RBAC QA
Prove the permission model works in practice.

Success targets:
- admin full power works
- coordinator scope restrictions work
- reviewer only gets review-related edit powers
- member/freelancer only gets personal-scope access and partial edit powers where intended
- direct URL and forged UI attempts fail
- no obvious role leakage remains

### Pass 3 — Payments / Compensation Sanity
Make sure money-related flows are correct and safe to use internally.

Success targets:
- compensation records behave correctly
- payments behave correctly
- member only sees own payment rows
- admin-only mutations are enforced
- IDR formatting is consistent
- batch/detail/edit flows work
- outstanding / paid / partial logic is correct

### Pass 4 — Dashboard Payment Snapshot
Make the dashboard money signal good enough for daily owner/admin use.

Success targets:
- payment snapshot is not a weak placeholder
- owner/admin can quickly understand outstanding / unpaid / partial / paid state
- visual signal is clean and useful
- no noisy BI-style complexity
- low-data states still look intentional

## Manual pre-Stage-7 sign-off
Do not start Stage 7 until the answer is “yes” to all of these:

- Does the app feel visually coherent across dashboard, lists, details, forms, and settings?
- Does each role behave correctly in practice?
- Are create/edit/delete restrictions enforced at UI and server level?
- Do payments and compensation behave correctly?
- Is the dashboard useful enough for owner/admin daily overview?
- Are there no critical broken flows left?
- Can you do a realistic manual test without hitting obvious “unfinished” areas?

If any answer is “no”, do not start Stage 7 yet.
