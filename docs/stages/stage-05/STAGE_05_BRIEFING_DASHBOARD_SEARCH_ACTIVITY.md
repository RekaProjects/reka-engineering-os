# Stage 05 Briefing — Dashboard, Search, Activity, Workload

## Stage goal
Give the owner a real control tower: what is active, what is late, what is blocked, what is waiting on the client, and who is overloaded.

## Mission
Implement:
- operational dashboard
- global search
- activity log views
- workload summaries
- "needs attention" experience
- recent activity and deadline visibility

## In-scope deliverables
1. Dashboard page with meaningful KPI cards
2. Needs Attention section
3. Urgent Projects section
4. Upcoming Deadlines section
5. Recent Activity section
6. Team Workload section
7. Basic project/deliverable/task status summaries
8. Global search input for core entities
9. Activity page or panel if appropriate
10. Query and aggregation logic that is maintainable

## Out of scope
Do not build:
- deep business analytics
- revenue dashboards
- advanced forecasting
- noisy decorative charts
- real-time collaboration if not already needed

## Dashboard requirements
### KPI cards
Show at least:
- Active Projects
- Overdue Tasks
- Tasks Due This Week
- Deliverables Waiting Review
- Projects Waiting Client
- Projects In Revision

### Needs Attention
This is a required section.
Show items such as:
- overdue tasks
- blocked tasks
- projects with no lead
- projects with no due date
- deliverables in revision requested
- projects waiting client too long if practical
- any clearly broken operational states

### Urgent Projects
Prioritize by:
- urgency
- due date proximity
- overdue indicators
- blocked state
- revision state

### Upcoming Deadlines
Show:
- task deadlines
- project due dates
- deliverable submission due signals if modeled

### Recent Activity
Show recent important events:
- intake created/updated
- project created/converted
- task status changed
- deliverable status changed
- file attached
- assignment changes

### Team workload
Show concise workload overview by user:
- active tasks
- overdue tasks
- due this week
- simple workload label such as Low / Normal / High / Overloaded

## Global search requirements
Support searching:
- clients
- intakes
- projects
- tasks
- deliverables

Search UX should be simple:
- topbar command-style search or compact search panel
- useful result grouping
- fast access to detail pages
- graceful empty states

## Activity requirements
If full page is overkill, at least provide:
- a robust recent activity card/panel
- project detail activity already exists or is improved
- optional dedicated activity page if implementation is clean

## UX rules
- dashboard should prioritize clarity, not chart quantity
- cards should be concise
- sections should be visually distinct but not noisy
- tables/lists within dashboard should stay compact
- avoid too many colors
- "needs attention" must be immediately understandable

## Data and query considerations
- write maintainable aggregation logic
- avoid giant one-file query spaghetti
- use helper functions or services
- handle empty data gracefully
- if performance becomes a concern, choose sensible optimizations but do not prematurely overengineer

## Required final output from AI for this stage
1. summary of dashboard/search/activity/workload work
2. changed files
3. explanation of KPI data sourcing
4. explanation of workload calculation logic
5. limitations or future enhancement notes
6. QA checklist
7. readiness statement for Stage 06

## Definition of done
This stage is done when:
- the dashboard feels like a real operational control center
- the owner can quickly spot urgent problems
- search improves navigation materially
- recent activity and workload views are useful
- the app now feels like a coherent internal product rather than disconnected CRUD screens
