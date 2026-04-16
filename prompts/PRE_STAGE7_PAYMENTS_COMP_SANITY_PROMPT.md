Read these files first:

1. docs/PRE_STAGE7_MASTER_CHECKLIST.md
2. docs/PRE_STAGE7_PAYMENTS_COMP_SANITY_BRIEFING.md
3. .cursor/rules/pre-stage7-readiness.mdc

Important:
- We are only doing the Payments / Compensation Sanity Pass
- Do not jump to UI completeness, RBAC QA, dashboard payment snapshot, or Stage 7
- Do not add finance features
- Do not redesign UI broadly
- Do not expand this into payroll, accounting, or invoicing
- Preserve current flows

Goal:
Make sure payments and compensation are correct, role-safe, and operationally usable before deployment hardening.

Your task:
1. Inspect the current compensation/payment implementation.
2. Identify any remaining correctness, access, or workflow risks.
3. Verify role behavior across admin vs member visibility and mutation access.
4. Verify IDR formatting and status/balance logic.
5. List the exact files/folders you will modify.

Before coding:
1. list the exact files/folders you will modify
2. explain what is still incomplete or risky
3. restate the Payments / Compensation Sanity Pass scope
4. identify the highest-risk correctness or access issue

Then implement the Payments / Compensation Sanity Pass only.

After implementation, stop and report:
- files modified
- payment correctness fixes
- compensation correctness fixes
- role visibility/access fixes
- IDR/status/balance fixes
- remaining payment/comp debt, if any
- local QA checklist
