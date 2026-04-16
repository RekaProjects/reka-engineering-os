Read these files first:

1. docs/PRE_STAGE7_MASTER_CHECKLIST.md
2. docs/PRE_STAGE7_UI_COMPLETENESS_BRIEFING.md
3. .cursor/rules/pre-stage7-readiness.mdc

Important:
- We are only doing the UI Completeness Pass
- Do not jump to RBAC QA, payments sanity, dashboard payment snapshot, or Stage 7
- Do not add features
- Do not redesign the whole product again
- Do not change business logic
- Preserve all working flows

Goal:
Close the remaining UI consistency gap before deployment hardening.

Your task:
1. Inspect the current codebase against the UI completeness finish line.
2. Identify what is still incomplete across:
   - list pages
   - detail pages
   - forms
   - badges
   - empty states
3. List the exact files/folders you will modify.
4. Restate the implementation plan.
5. Keep this low-risk and finish-line focused.

Before coding:
1. list the exact files/folders you will modify
2. explain what is still incomplete
3. restate the UI Completeness Pass scope
4. identify the highest regression risk and how you will avoid it

Then implement the UI Completeness Pass only.

After implementation, stop and report:
- files modified
- list page consistency changes
- detail page consistency changes
- form consistency changes
- badge consistency changes
- empty-state consistency changes
- remaining UI debt, if any
- local QA checklist
