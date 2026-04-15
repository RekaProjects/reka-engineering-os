# Stage 04 Prompt — Antigravity / Claude

You are implementing **Stage 04 only** of an internal engineering agency control app.

Read:
1. `docs/prd/01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `docs/stages/stage-04/STAGE_04_BRIEFING_TASKS_DELIVERABLES_FILES.md`

## Mission
Build the execution layer:
- tasks
- deliverables
- files metadata
- revision workflow
- project tabs for operational work

## Critical instructions
- Stay focused on Stage 04.
- Do not switch into dashboard-heavy or analytics-heavy work yet.
- Do not build fancy preview systems for engineering files.
- Do not overcomplicate file integration; use the metadata/linking architecture described.
- Preserve a clean and highly usable project workspace.

## Must implement
1. task CRUD and filtering
2. deliverable CRUD and status flow
3. revision number handling
4. overdue and blocked task visibility
5. project tasks tab
6. project deliverables tab
7. project files tab
8. file metadata persistence and UI
9. activity logs for major actions if log system exists

## UX bar
- fast operational actions
- easy scanning
- obvious status
- obvious revision labels
- practical forms
- clear tables
- no clutter

## Data behavior
- task and deliverable schemas must be clean and future-proof
- file metadata must link properly to project/task/deliverable
- date-setting behaviors should be sane and documented
- keep Google Drive integration pragmatic

## Output contract
Provide:
1. summary of what was built
2. file changes
3. migrations
4. revision logic explanation
5. file-linking approach explanation
6. assumptions and limitations
7. manual QA checklist
8. Stage 05 readiness statement

## Self-review before finishing
- Can users now actually manage work inside a project?
- Are overdue and blocked tasks obvious?
- Are deliverable revisions understandable?
- Are Drive-linked files practical and not confusing?
- Does the UI still feel simple and professional?

Now implement Stage 04 completely.
