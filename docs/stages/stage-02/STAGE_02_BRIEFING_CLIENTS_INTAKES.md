# Stage 02 Briefing — Clients and Intakes

## Stage goal
Build the CRM-lite and intake layer so incoming work can be captured, reviewed, and organized before it becomes a project.

## Mission
Implement:
- clients module
- intakes module
- create/edit/list/detail flows
- qualification status handling
- high-quality operational tables and forms

This stage is about structured incoming work, not project execution yet.

## In-scope deliverables
1. Clients list page
2. Client detail page
3. Create/edit client forms
4. Intakes list page
5. Intake detail page
6. Create/edit intake forms
7. Intake status transitions
8. Search and filters for both modules
9. Database tables and migrations
10. Activity log entries for key create/update actions if basic logging exists
11. Strong empty states and inline validation

## Out of scope
Do not build:
- full project creation from intake yet unless minimal linking is necessary for schema continuity
- task generation
- deliverables
- Drive integration
- dashboard analytics
- advanced workload logic

## Client requirements
### Client fields
- client_code
- client_name
- client_type
- source_default
- primary_contact_name
- primary_contact_email
- primary_contact_phone
- company_name
- notes
- status

### Client statuses
- Lead
- Active
- Inactive
- Archived

### Client list columns
- Client Name
- Type
- Primary Contact
- Source
- Active Projects (placeholder if needed)
- Last Activity
- Status

### Client detail sections
- overview
- contact info
- notes
- linked intakes
- linked projects placeholder
- recent activity placeholder

## Intake requirements
### Intake fields
- intake_code
- client_id nullable
- temp_client_name
- source
- external_reference_url
- title
- short_brief
- discipline
- project_type
- proposed_deadline
- budget_estimate nullable
- estimated_complexity
- qualification_notes nullable
- status
- received_date
- created_by

### Intake statuses
- New
- Awaiting Info
- Qualified
- Rejected
- Converted

### Intake list columns
- Intake Code
- Client / Prospect
- Title
- Source
- Discipline
- Proposed Deadline
- Status
- Received Date

### Intake detail sections
- overview
- qualification notes
- source and external link
- discipline and type
- deadline and complexity
- status history placeholder
- actions panel

## UX requirements
### General
- forms should be clean and not overwhelming
- split dense forms into logical sections
- use sensible defaults and dropdowns
- date inputs must be clear and easy to use
- tables should be filterable and searchable
- create/edit flows should ideally use drawer or modal only if form length stays comfortable; otherwise use dedicated pages

### Filtering
Clients:
- search by name/contact
- filter by status
- filter by source

Intakes:
- search by title/client
- filter by status
- filter by source
- filter by discipline
- filter by deadline range if practical

### Empty states
Clients empty state should encourage creating first client.
Intakes empty state should encourage logging incoming leads from Upwork/Fiverr/direct.

## Data and validation requirements
- enforce required fields thoughtfully
- support client-less intake with temporary client name
- preserve data cleanliness
- avoid duplicate field naming confusion
- use server-side validation for mutations

## Permissions
- Owner/Admin can create, edit, view all
- Staff may have read-only or limited access as simple MVP policy; choose the simplest viable policy and document it clearly

## Activity logging
If activity log support exists, log:
- client created
- client updated
- intake created
- intake updated
- intake status changed

## Required final output from AI for this stage
1. summary of implemented client and intake features
2. changed files
3. migrations
4. validation decisions
5. limitations
6. QA checklist
7. readiness statement for Stage 03

## Definition of done
This stage is done when:
- owner can create and update clients
- owner can create and update intakes
- client and intake data are listable, searchable, and filterable
- detail pages are useful and organized
- status handling works cleanly
- UI remains calm and operational
