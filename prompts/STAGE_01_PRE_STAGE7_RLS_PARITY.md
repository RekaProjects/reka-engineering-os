Read these files from the project first, in this order:

1. docs/PRE_STAGE7_MASTER_6_STAGE_BRIEFING.md
2. docs/PRE_STAGE7_ROLE_QA_MATRIX.md
3. .cursor/rules/pre-stage7-6stage.mdc

Important:
- Follow the project rule file strictly
- We are only doing Stage 01: RLS parity
- Do not jump ahead to later stages
- Do not add features
- Do not redesign UI
- Do not redesign architecture broadly
- Preserve all working flows

Current goal:
Inspect the current database access model and close the most practical RLS parity gaps so database-level rules align with the app permission model as closely as possible before deploy.

Focus areas:
- projects
- project_team_assignments
- tasks
- deliverables
- files / project_files
- clients
- intakes
- compensation records
- payment records
- invites / team tables where relevant

Before coding:
1. list the exact files/folders you will modify
2. explain the current RLS gaps
3. explain the highest-risk tables
4. explain the safest implementation plan
5. explain how existing flows will be preserved

Then implement Stage 01 only.

After implementation, stop and report:
- files modified
- RLS parity changes made
- affected tables
- any tables intentionally deferred
- local verification checklist
- remaining production risks, if any
