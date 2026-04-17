Read these files from the project first, in this order:

1. docs/PRE_STAGE7_MASTER_6_STAGE_BRIEFING.md
2. docs/PRE_STAGE7_ROLE_QA_MATRIX.md
3. .cursor/rules/pre-stage7-6stage.mdc

Important:
- Follow the project rule file strictly
- We are only doing Stage 02: Minimal status transition rules
- Do not jump ahead
- Do not add features
- Do not redesign UI broadly
- Do not redesign architecture broadly
- Preserve all working flows

Current goal:
Introduce minimal, practical workflow discipline so role-based status changes are not too permissive.

Focus areas:
- tasks
- deliverables
- payments if low-risk and clearly appropriate
- optionally project / intake statuses only if already simple and safe

Requirements:
- keep it minimal and explicit
- do not build a giant workflow engine
- align transitions with role intent
- admin/coordinator broader transitions within intended scope
- reviewer review-relevant transitions only
- member/freelancer execution/submission-relevant transitions only

Before coding:
1. list the exact files/folders you will modify
2. explain the current transition gaps
3. explain the proposed minimal rule set by entity and role
4. explain the safest implementation plan
5. explain how regressions will be avoided

Then implement Stage 02 only.

After implementation, stop and report:
- files modified
- status transition rules added
- affected entities
- role-based behavior clarified
- anything intentionally left permissive
- local QA checklist
