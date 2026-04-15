# Stage 03 Prompt — Antigravity / Claude

You are implementing **Stage 03 only** of an internal engineering agency control app.

Read:
1. `docs/prd/01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `docs/stages/stage-03/STAGE_03_BRIEFING_PROJECTS_TEAM_ASSIGNMENT.md`

## Mission
Build the project control core:
- projects module
- intake-to-project conversion
- project detail workspace
- team assignment

## Critical instructions
- Do not fully build tasks, deliverables, dashboard, or Drive integration yet beyond placeholder hooks.
- Keep the architecture ready for those future modules.
- Reuse design system and layout patterns from earlier stages.
- Make the project detail page feel serious and operational, not decorative.

## Must implement
1. project CRUD
2. project list with search/filter/sort
3. project detail page with tabs
4. intake conversion flow
5. project code generation
6. project team assignment UI and persistence
7. clean status + priority + waiting-on handling

## UX bar
- table-first list
- project header with strong hierarchy
- sticky-feeling quick actions if practical
- overview tab useful on day one
- tabs not crowded
- calm and disciplined design

## Data behavior
- converting an intake should preserve lineage
- converting should not lose intake context
- if temp client name exists, provide a simple path to associate or create client
- project team should be stored cleanly
- project statuses must be consistent with PRD

## Output contract
When done, provide:
1. summary of implemented features
2. file changes
3. migrations
4. conversion-flow notes
5. assumptions and simplifications
6. known limitations
7. manual QA checklist
8. Stage 04 readiness statement

## Self-review before finishing
- Can a qualified intake become a project cleanly?
- Does the project detail page already feel useful?
- Are team assignments understandable?
- Is the codebase still modular?
- Did you avoid overbuilding later-stage features?

Now implement Stage 03 completely.
