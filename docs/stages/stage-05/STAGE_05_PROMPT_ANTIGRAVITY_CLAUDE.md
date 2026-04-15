# Stage 05 Prompt — Antigravity / Claude

You are implementing **Stage 05 only** of an internal engineering agency control app.

Read:
1. `docs/prd/01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `docs/stages/stage-05/STAGE_05_BRIEFING_DASHBOARD_SEARCH_ACTIVITY.md`

## Mission
Build the control-tower layer:
- dashboard
- needs attention
- workload summary
- recent activity
- global search

## Critical instructions
- Keep this stage operational, not decorative.
- Do not turn the dashboard into a generic analytics product.
- Use charts sparingly and only if they add real value.
- Prioritize urgency visibility, deadline visibility, and bottleneck visibility.
- Preserve calm and disciplined UI.

## Must implement
1. KPI cards
2. Needs Attention section
3. urgent projects list
4. upcoming deadlines list
5. recent activity list
6. team workload summary
7. global search across core entities

## UX bar
- dashboard immediately useful
- minimal fluff
- clear hierarchy
- sections easy to scan
- color used intentionally, not excessively

## Data behavior
- KPI counts must be grounded in real data
- overdue logic must be consistent with task/project states
- workload logic should be simple and explainable
- search should return meaningful grouped results

## Output contract
Provide:
1. summary of what was built
2. file changes
3. KPI calculation notes
4. workload logic notes
5. known limitations
6. manual QA checklist
7. Stage 06 readiness statement

## Self-review before finishing
- Does the dashboard tell the owner what needs attention now?
- Are the KPI definitions sensible?
- Is the workload display useful rather than decorative?
- Is search genuinely helpful?
- Did you avoid overbuilding analytics?

Now implement Stage 05 completely.
