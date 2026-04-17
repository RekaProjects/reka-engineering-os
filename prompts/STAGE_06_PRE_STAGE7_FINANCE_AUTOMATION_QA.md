Read these files from the project first, in this order:

1. docs/PRE_STAGE7_MASTER_6_STAGE_BRIEFING.md
2. docs/PRE_STAGE7_FINANCE_AUTOMATION_BRIEFING.md
3. .cursor/rules/pre-stage7-6stage.mdc

Also use the completed Stage 04 and Stage 05 outputs as the current source of truth.

Important:
- Follow the project rule file strictly
- We are only doing Stage 06: Finance automation lite QA sweep
- Do not add new features
- Do not redesign the product broadly
- Preserve all working flows and role restrictions

Current goal:
Verify the automation-lite implementation is correct, practical, and deploy-safe.

QA focus:
1. admin can identify payment-ready compensation clearly
2. admin workflow is less manual
3. totals and rollups remain correct
4. payment status logic still behaves correctly
5. member-facing payment history still works
6. no role leakage was introduced
7. no misleading UI was introduced

Before coding:
1. list the exact files/folders you will modify
2. identify any remaining QA gaps
3. explain the safest cleanup plan
4. confirm this stage is QA and cleanup only

Then implement Stage 06 only.

After implementation, stop and report:
- files modified
- QA fixes made
- final workflow behavior
- remaining limitations, if any
- local QA checklist
- whether all 6 pre-Stage-7 stages are now fully complete
