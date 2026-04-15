# Stage 02 Prompt — Antigravity / Claude

You are implementing **Stage 02 only** of an internal engineering agency control app.

Read and follow:
1. `docs/prd/01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `docs/stages/stage-02/STAGE_02_BRIEFING_CLIENTS_INTAKES.md`

## Mission
Build the clients and intakes modules with production-quality CRUD, list views, detail views, validation, and clean operational UX.

## Critical instructions
- Stay within Stage 02.
- Do not build full project execution features yet.
- Keep UI simple, clean, and dense-but-readable.
- Use table-first layouts for lists.
- Keep forms structured and low-friction.
- Reuse Stage 01 layout and design system.
- Preserve architecture for future stages.

## Must-have outputs
### Clients
- client list page
- create client
- edit client
- client detail page
- search/filter
- status badge handling

### Intakes
- intake list page
- create intake
- edit intake
- intake detail page
- search/filter
- status transitions
- qualification notes support

### Database
- tables / migrations
- types
- validation
- clean server-side mutations

## UX bar
- no clutter
- obvious create actions
- obvious row click to details
- clear empty states
- clear forms
- consistent page headers
- status badges consistent with system palette

## Important product behavior
- an intake can exist without a linked client
- temporary prospect name is allowed
- intakes are not yet fully projects
- keep data model ready for conversion later
- do not overbuild permissions

## Output contract
At the end provide:
1. what was implemented
2. changed files
3. migrations
4. assumptions made
5. known limitations
6. manual QA checklist
7. statement of Stage 03 readiness

## Self-review before finishing
- Can a new client be created easily?
- Can a new intake be created quickly from a lead?
- Do tables support operational scanning?
- Are details pages useful and not bloated?
- Is the model ready for project conversion later?
- Did you avoid building future-stage features unnecessarily?

Now implement Stage 02 completely.
