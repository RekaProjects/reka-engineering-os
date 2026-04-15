# Master PRD — Engineering Agency Control App

## 1. Product name
Working name: **Engineering Agency Control App**

## 2. Product type
Internal desktop-first web application.

## 3. Product purpose
This app is the internal operating system for a small engineering agency focused on:
- mechanical projects
- civil projects
- client acquisition from Upwork, Fiverr, and direct channels
- delegation of project work to staff / subcontractors
- tracking tasks, deliverables, revisions, deadlines, and file links

The app is not meant to replace engineering authoring tools such as CAD, BIM, modeling, or spreadsheet-heavy calculations. It is a control layer for operational visibility and execution.

## 4. Primary users
### 4.1 Owner / Admin
The business owner who:
- receives leads
- qualifies work
- converts leads into projects
- assigns team members
- reviews progress
- tracks deliverables
- monitors deadlines and bottlenecks

### 4.2 Staff
Team members who:
- see assigned projects and tasks
- update progress
- upload or attach working files
- submit deliverables for review
- track revisions

## 5. Core user problems
1. Project opportunities arrive in multiple channels and are easy to lose.
2. Active projects become messy because ownership and deadlines are unclear.
3. Tasks, revisions, and deliverables are often tracked in multiple places.
4. File versions become confusing.
5. Owner lacks a single operational dashboard to understand what needs attention now.

## 6. Product goals
The app must enable the owner to answer these questions quickly:
1. Which leads are new and need qualification?
2. Which projects are active right now?
3. Who is assigned to each project and task?
4. What is overdue or at risk?
5. Which deliverables are in review, pending client response, or stuck in revision?
6. Where is the relevant project folder or file in Google Drive?

## 7. Non-goals for MVP
Do not build these in MVP:
- accounting suite
- payroll
- invoicing system
- advanced HR
- full client portal
- in-app CAD preview
- highly granular permissions
- mobile-first experience
- WhatsApp automation
- complex calendar sync
- AI review of technical documents
- multi-company or holding-company support

## 8. Primary modules
1. Dashboard
2. Clients
3. Intakes
4. Projects
5. Tasks
6. Deliverables
7. Files / Google Drive links
8. Team
9. Activity log
10. Settings / templates

## 9. Data model overview
### 9.1 Users
Represents authenticated internal users.

Fields:
- id
- full_name
- email
- role
- discipline
- is_active
- created_at
- updated_at

### 9.2 Clients
Represents companies or individuals commissioning work.

Fields:
- id
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
- created_at
- updated_at

### 9.3 Intakes
Represents incoming opportunities before they become projects.

Fields:
- id
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
- converted_project_id nullable
- created_at
- updated_at

### 9.4 Projects
Represents active or historical work.

Fields:
- id
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
- created_by
- created_at
- updated_at

### 9.5 Tasks
Represents executable work items.

Fields:
- id
- project_id
- parent_task_id nullable
- title
- description
- category
- phase
- assigned_to_user_id
- reviewer_user_id nullable
- start_date nullable
- due_date nullable
- completed_date nullable
- estimated_hours nullable
- actual_hours nullable
- priority
- status
- progress_percent
- blocked_reason nullable
- drive_link nullable
- notes nullable
- created_by
- created_at
- updated_at

### 9.6 Deliverables
Represents project outputs that are reviewed, issued, revised, or approved.

Fields:
- id
- project_id
- linked_task_id nullable
- name
- type
- revision_number
- version_label nullable
- description nullable
- status
- prepared_by_user_id
- reviewed_by_user_id nullable
- submitted_to_client_date nullable
- approved_date nullable
- client_feedback_summary nullable
- file_link nullable
- created_at
- updated_at

### 9.7 Files
Represents file metadata stored in app database while actual files remain in Google Drive.

Fields:
- id
- project_id
- task_id nullable
- deliverable_id nullable
- google_drive_file_id
- google_drive_folder_id nullable
- file_name
- mime_type
- extension
- file_category
- revision_number nullable
- version_label nullable
- google_web_view_link
- uploaded_by_user_id
- uploaded_at

### 9.8 Project team assignments
Represents membership of users on projects.

Fields:
- id
- project_id
- user_id
- team_role
- assigned_at

### 9.9 Activity logs
Represents audit-like activity.

Fields:
- id
- entity_type
- entity_id
- action_type
- user_id
- note nullable
- created_at

## 10. Status systems
### 10.1 Intake status
- New
- Awaiting Info
- Qualified
- Rejected
- Converted

### 10.2 Project status
- New
- Ready to Start
- Ongoing
- Internal Review
- Waiting Client
- In Revision
- On Hold
- Completed
- Cancelled

### 10.3 Task status
- To Do
- In Progress
- Review
- Revision
- Blocked
- Done

### 10.4 Deliverable status
- Draft
- Internal Review
- Ready to Submit
- Sent to Client
- Revision Requested
- Approved
- Final Issued

## 11. Operational flows
### 11.1 Lead / intake flow
1. New lead arrives from Upwork, Fiverr, or direct.
2. Owner creates intake.
3. Intake is reviewed and qualified.
4. Intake is either rejected, held, or converted into a project.

### 11.2 Project creation flow
1. Owner selects or creates client.
2. Owner creates project from intake or manually.
3. Project code is generated.
4. Optional Google Drive folder is created / linked.
5. Optional task template is applied.
6. Team members are assigned.
7. Project becomes active.

### 11.3 Execution flow
1. Staff work on assigned tasks.
2. Task status and progress are updated.
3. Files are attached or linked.
4. Deliverables are prepared and submitted for review.
5. Owner or reviewer checks progress and bottlenecks.

### 11.4 Revision flow
1. Deliverable is submitted to client.
2. Client requests revision.
3. Deliverable status changes to Revision Requested.
4. Project may automatically switch to In Revision.
5. Revision task is created or reopened.
6. Updated revision is re-issued.

### 11.5 Project closure flow
1. Final deliverables are issued.
2. Project status changes to Completed.
3. Completion date is stored.
4. Final linked files remain accessible via project page.

## 12. Dashboard requirements
The dashboard must show:
- active projects count
- overdue tasks count
- tasks due this week
- deliverables waiting review
- projects waiting client
- projects in revision
- urgent projects list
- upcoming deadlines
- recent activity
- team workload summary
- needs attention list

The dashboard must prioritize operational clarity over visual flair.

## 13. UI/UX principles
### 13.1 General principles
- desktop-first
- simple and highly scannable
- table-first for operational data
- cards only for summaries and focused snapshots
- consistent status badge colors
- limited color palette
- clear hierarchy
- fast create / edit flows via drawers or modals
- detail pages use tabs

### 13.2 Layout
- left sidebar
- slim top bar
- main content area with standard page header
- page header always includes title, subtitle, and primary actions
- filters should be visible without burying them

### 13.3 Navigation
Sidebar:
- Dashboard
- Clients
- Intakes
- Projects
- Tasks
- Deliverables
- Team
- Settings

### 13.4 Page header pattern
Every main page should have:
- page title
- secondary explanation
- search
- filters
- primary create action

### 13.5 Detail page pattern
Every detail page should have:
- summary header
- status and priority badges
- quick actions
- tabbed sub-sections

### 13.6 Table design
Tables should:
- support search
- support filter
- support sort
- allow row click to detail page
- use compact but readable spacing
- show status with color and text, never color alone

## 14. Design system requirements
### 14.1 Color palette
#### Neutrals
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Surface subtle: `#F1F5F9`
- Border: `#E2E8F0`
- Text primary: `#0F172A`
- Text secondary: `#475569`
- Text muted: `#64748B`

#### Primary accent
- Primary: `#1D4ED8`
- Primary hover: `#1E40AF`
- Primary subtle: `#DBEAFE`

#### Status colors
- Neutral / Draft: `#94A3B8`
- Active / In Progress: `#2563EB`
- Review / Waiting: `#D97706`
- Success / Completed: `#16A34A`
- Error / Blocked / Overdue: `#DC2626`

### 14.2 Typography
- clean sans-serif
- body 14px–15px
- small helper text 12px
- headings 20px–28px
- consistent font weight usage

### 14.3 Component priorities
Must have:
- buttons
- inputs
- textareas
- selects
- badges
- tables
- cards
- tabs
- drawers / sheets
- dialogs
- date pickers if needed
- search bars
- empty states
- skeleton loaders

## 15. Google Drive integration requirements
### 15.1 Principle
App database stores metadata. Google Drive stores actual files.

### 15.2 Core capabilities
- link project to Drive folder
- open Drive folder from project page
- attach existing Drive file to project/task/deliverable
- record file metadata in database
- show file list in project detail

### 15.3 Suggested Drive folder structure
`Clients/CLIENT-[code]-[name]/PRJ-[project_code]-[project_name]/`
with subfolders:
- 01_Brief
- 02_Reference
- 03_Working
- 04_Internal_Review
- 05_Submission
- 06_Final
- 07_Revisions

## 16. Security requirements
- Supabase Auth required
- all app routes protected except auth pages
- role-aware UI and actions
- Row Level Security enabled
- users see only allowed data
- server-side validation for mutations
- clear handling of unauthenticated and unauthorized states

## 17. Performance requirements
- pages should load fast on typical laptop internet
- use server components where appropriate
- use pagination or sensible list limits if needed
- avoid loading overly large data sets by default
- avoid unnecessary client-only rendering

## 18. Acceptance criteria for MVP
The MVP is successful if:
1. Owner can create and manage clients and intakes.
2. Owner can convert intakes into projects.
3. Owner can assign team members and tasks.
4. Staff can update task progress and status.
5. Deliverables and revisions can be tracked.
6. Google Drive folders/files can be linked.
7. Dashboard highlights current priorities and issues.
8. UI remains simple, professional, and easy to scan.
9. Architecture remains maintainable and modular.

## 19. Suggested build stages
1. Foundation and design system
2. Clients and intakes
3. Projects and team assignment
4. Tasks, deliverables, and files
5. Dashboard, search, and activity
6. Polish, QA, and handoff

## 20. Final product quality bar
The product must feel:
- professional
- operational
- calm
- efficient
- easy to scan
- easy to trust

It must not feel:
- flashy
- gimmicky
- cluttered
- overdesigned
- like a generic startup template
