Read these files from the project first, in this order:

1. docs/PRE_STAGE7_MASTER_6_STAGE_BRIEFING.md
2. docs/PRE_STAGE7_ROLE_QA_MATRIX.md
3. .cursor/rules/pre-stage7-6stage.mdc

Important:
- Follow the project rule file strictly
- We are only doing Stage 03: CTA leak cleanup + final role QA
- Do not jump ahead
- Do not add features
- Do not redesign architecture
- Do not redesign UI broadly
- Preserve all working flows

Current goal:
Remove remaining unauthorized CTAs everywhere and finish the final manual QA matrix by role.

Critical issue to fix:
Unauthorized roles must not see misleading create/edit actions such as:
- New Project
- New Task
- New Deliverable
- Add File
- Edit buttons
- other create/edit/delete CTAs they cannot actually use

Sweep these surfaces:
- dashboard quick actions
- page header actions
- empty state primary buttons
- project hub buttons
- tab-level CTAs
- card-level CTAs
- detail-page edit buttons
- list-page create buttons
- scattered operational shortcuts

Before coding:
1. list the exact files/folders you will modify
2. explain the remaining CTA leak or role-surface risks
3. explain how the final manual QA matrix will be validated
4. explain the safest implementation plan

Then implement Stage 03 only.

After implementation, stop and report:
- files modified
- CTA leaks fixed
- role-surface cleanup completed
- final manual QA matrix results
- remaining non-blocking debt, if any
- whether hardening stages 01–03 are complete
