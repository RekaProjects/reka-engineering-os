# Stage 03 Briefing — Projects, Conversion Flow, Team Assignment

## Stage goal
Turn qualified work into managed projects and establish the core project control experience.

## Mission
Implement:
- project data model
- project CRUD
- intake-to-project conversion flow
- project detail page
- project team assignment
- template-ready architecture
- project operational statuses

## In-scope deliverables
1. Projects list page
2. Project detail page
3. Create/edit project flow
4. Convert qualified intake to project flow
5. Project code generation
6. Project status management
7. Team assignment model and UI
8. Project overview tab
9. Project tabs scaffolding for tasks, deliverables, files, team, activity
10. Optional starter task template architecture, even if actual task generation remains simple
11. Project-level filtering, sorting, searching

## Out of scope
Do not fully build:
- task execution module
- deliverable module
- file integration beyond project folder placeholders
- dashboard analytics
- advanced workload engine

## Project requirements
### Core fields
- project_code
- client_id
- intake_id nullable
- name
- source
- external_reference_url
- discipline
- project_type
- scope_summary
- start_date
- target_due_date
- actual_completion_date nullable
- project_lead_user_id
- reviewer_user_id nullable
- priority
- status
- progress_percent
- waiting_on
- google_drive_folder_id nullable
- google_drive_folder_link nullable
- notes_internal nullable

### Project statuses
- New
- Ready to Start
- Ongoing
- Internal Review
- Waiting Client
- In Revision
- On Hold
- Completed
- Cancelled

### Waiting on values
- None
- Internal
- Client
- Vendor

### Project list columns
- Project Code
- Project Name
- Client
- Discipline
- Type
- Lead
- Priority
- Status
- Due Date
- Progress
- Waiting On
- Last Update

## Intake conversion requirements
From intake detail page and/or list actions, owner can:
- convert a qualified intake to a project
- select existing client or create one if intake used temp client
- prefill project fields from intake
- carry over source, brief, discipline, project type, due date, external link
- update intake status to Converted
- preserve linkage between intake and project

If there are assumptions needed for client creation from temp client, keep them simple and well-documented.

## Team assignment requirements
At project level support:
- project lead
- reviewer optional
- additional team members
- team role on project

Suggested roles:
- Lead
- Engineer
- Drafter
- Checker
- Support

## Project detail UX requirements
### Header
Must show:
- project name
- project code
- client
- status badge
- priority badge
- due date
- lead
- progress
- quick actions

### Tabs
- Overview
- Tasks
- Deliverables
- Files
- Team
- Activity

Only Overview and Team need real functionality in this stage; others can be strong placeholders.

### Overview tab
Show:
- core project info
- source and external link
- scope summary
- dates
- lead and reviewer
- waiting on
- notes
- team summary
- linked intake
- linked client

### Team tab
Show:
- members
- roles
- discipline
- active status placeholder

## UX rules
- projects list must be highly scannable
- filters visible near top
- project detail must feel like the main operational workspace
- progress display must be restrained and meaningful
- do not fake analytics with decorative charts
- conversion flow must be safe and understandable

## Data / automation requirements
- generate `project_code` deterministically or with a documented simple scheme
- update intake status to Converted upon successful conversion
- optionally create starter project team record for lead
- optionally initialize progress to 0
- activity logs should record project creation and conversion if log system exists

## Required final output from AI for this stage
1. summary of project module implementation
2. changed files
3. migrations
4. explanation of intake conversion logic
5. explanation of project code generation approach
6. limitations / placeholders left for future stages
7. QA checklist
8. readiness statement for Stage 04

## Definition of done
This stage is done when:
- projects can be created and edited
- projects can be created from qualified intakes
- project list and detail pages are useful and polished
- team assignment exists
- status and priority handling are consistent
- the app now feels like a real project control system
