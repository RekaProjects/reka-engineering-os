Read these files first:

1. docs/PRE_STAGE7_MASTER_CHECKLIST.md
2. docs/PRE_STAGE7_RBAC_QA_BRIEFING.md
3. .cursor/rules/pre-stage7-readiness.mdc

Important:
- We are only doing the RBAC QA Pass
- Do not jump to UI completeness, payments sanity, dashboard payment snapshot, or Stage 7
- Do not redesign UI broadly
- Do not add features
- Do not refactor the auth system unnecessarily
- Preserve current working flows

Goal:
Validate and tighten the role system before deployment hardening.

Your task:
1. Inspect the current RBAC implementation and identify any remaining practical leakage.
2. Verify role behavior across:
   - surface visibility
   - route access
   - button/action visibility
   - server mutation paths
   - scoped query behavior
3. Identify any remaining mismatches between UI behavior and server behavior.
4. List the exact files/folders you will modify.
5. Keep this practical and freelance-first.

Before coding:
1. list the exact files/folders you will modify
2. explain what is still incomplete or risky
3. restate the RBAC QA Pass scope
4. identify the highest-risk leakage or mismatch

Then implement the RBAC QA Pass only.

After implementation, stop and report:
- files modified
- role leakage issues fixed
- UI/server alignment fixes
- scoped visibility fixes
- access-denied / read-only consistency fixes
- remaining RBAC debt, if any
- QA checklist by role
