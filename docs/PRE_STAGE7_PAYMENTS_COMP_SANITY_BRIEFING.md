# Pre-Stage-7 Briefing — Payments / Compensation Sanity Pass

## Purpose

Payments and compensation are too sensitive to leave half-checked before deployment hardening.
This pass exists to ensure that money-related flows are operationally correct and role-safe.

This is not a finance suite expansion.
This is not a UI redesign pass.
This is a **sanity + correctness + access pass**.

## Required outcomes

### 1. Compensation correctness
Check that compensation records behave correctly for the intended admin-only mutation model.

### 2. Payment correctness
Check that payment records, totals, statuses, and outstanding logic behave correctly.

### 3. Role safety
Check that members only see their own payment data and cannot mutate payment/compensation data.

### 4. IDR correctness
Check that formatting is consistent and practical.

### 5. Workflow sanity
Check that batch/detail/edit flows make sense for real internal use.

## Specific things to verify
- compensation create/edit/delete behavior
- payment create/edit/delete behavior
- batch behavior if present
- status logic: unpaid / partial / paid
- outstanding / balance logic
- proof/reference links
- visibility by role
- redirects or denials for forbidden routes/actions

## What not to do
- do not add invoicing
- do not add tax logic
- do not add accounting/ledger features
- do not add auto-transfer or payment automation
- do not expand scope beyond tracking sanity and access correctness

## Deliverable
At the end of this pass, payment/compensation should be safe enough to take into deployment hardening.
