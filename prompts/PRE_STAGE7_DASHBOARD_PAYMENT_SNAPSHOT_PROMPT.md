Read these files first:

1. docs/PRE_STAGE7_MASTER_CHECKLIST.md
2. docs/PRE_STAGE7_DASHBOARD_PAYMENT_SNAPSHOT_BRIEFING.md
3. .cursor/rules/pre-stage7-readiness.mdc

Important:
- We are only doing the Dashboard Payment Snapshot Pass
- Do not redesign the whole dashboard again
- Do not jump to Stage 7
- Do not add finance features
- Do not expand into BI or analytics complexity
- Preserve the current dashboard structure

Goal:
Make the dashboard payment snapshot useful enough for owner/admin daily overview before deployment hardening.

Your task:
1. Inspect the current dashboard payment snapshot implementation.
2. Identify what is still weak, placeholder-like, or low-signal.
3. Determine whether low-risk read-only aggregates are needed.
4. List the exact files/folders you will modify.
5. Keep this small, disciplined, and high-signal.

Before coding:
1. list the exact files/folders you will modify
2. explain what is still weak or incomplete
3. restate the Dashboard Payment Snapshot Pass scope
4. identify the highest-risk implementation concern

Then implement the Dashboard Payment Snapshot Pass only.

After implementation, stop and report:
- files modified
- payment snapshot improvements made
- low-data fallback improvements made
- any new aggregates/queries added
- remaining dashboard payment debt, if any
- local QA checklist
