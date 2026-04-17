Read these files from the project first, in this order:

1. docs/PRE_STAGE7_MASTER_6_STAGE_BRIEFING.md
2. docs/PRE_STAGE7_FINANCE_AUTOMATION_BRIEFING.md
3. .cursor/rules/pre-stage7-6stage.mdc

Also use the completed Stage 04 audit/plan as the source of truth.

Important:
- Follow the project rule file strictly
- We are only doing Stage 05: Finance automation lite implementation
- Do not jump ahead to Stage 06 QA
- Do not add features outside this finance automation-lite scope
- Preserve all role restrictions and working flows

Current goal:
Implement the approved low-risk finance automation-lite layer so the compensation/payment workflow feels more connected and less manual.

Target outcomes:
- compensation and payments feel connected
- admin sees payment-ready compensation more clearly
- due / pending / paid amounts roll up more naturally
- payment creation or preparation requires less duplicate manual work
- member-facing payment history remains intact

Constraints:
- no payroll
- no tax
- no invoicing
- no real transfer automation
- no broad UI redesign
- no architecture rewrite

Before coding:
1. list the exact files/folders you will modify
2. restate the approved automation-lite approach
3. explain how admin workflow will improve
4. explain how role safety will be preserved
5. explain the highest regression risk

Then implement Stage 05 only.

After implementation, stop and report:
- files modified
- automation-lite changes made
- admin workflow improvements
- any new helper queries or helper types added
- remaining limitations by design
- local QA checklist
