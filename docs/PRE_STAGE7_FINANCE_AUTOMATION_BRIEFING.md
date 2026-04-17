# Finance Automation Lite Briefing

## Objective
The current compensation / payments system is usable, but still feels too manual for daily ops.

We want a **light automation layer** that makes:
- compensation and payments feel connected
- admin prep flow feel lighter
- pending / due / paid totals feel easier to understand

This is NOT:
- payroll
- tax software
- invoicing
- bank transfer automation
- accounting ledger expansion

## Target experience
1. Work / deliverable / admin logic creates approved compensation records
2. Approved unpaid compensation becomes payment-ready
3. Admin can review grouped pending amounts per member / period
4. Payment creation requires less duplicate manual input
5. Member sees a cleaner payment history

## Constraints
- keep admin as the mutation authority unless explicitly intended otherwise
- keep the system internal and deploy-safe
- prefer low-risk helper layers over heavy product expansion

## Success criteria
- admin no longer feels the money workflow is overly manual
- compensation and payments feel connected
- outstanding / due / paid states remain sane
- member-facing payment history still works
- no payroll/tax/invoice scope creep
