# Stage 04 Briefing — Tasks, Deliverables, Files, Revision Tracking

## Stage goal
Build the execution layer of the app so active projects can be worked on, reviewed, revised, and linked to real files.

## Mission
Implement:
- tasks module
- deliverables module
- file metadata module
- project-level tasks and deliverables tabs
- revision-aware deliverable UX
- Google Drive metadata/linking groundwork

## In-scope deliverables
1. Tasks list page
2. Task create/edit/detail or drawer flow
3. Project Tasks tab with task management
4. Deliverables list page
5. Deliverable create/edit/detail flow
6. Project Deliverables tab
7. File metadata data model
8. Project Files tab
9. Attach-link flow for Drive file metadata
10. Revision number handling
11. Overdue and blocked task treatment
12. Basic activity logging for important changes

## Out of scope
Do not build:
- full Google OAuth/Picker if environment is not yet ready; a strong metadata/link attachment flow is acceptable, but structure for full Drive integration
- in-browser file preview for CAD/3D
- advanced comments system
- advanced notification system
- deep real-time collaboration

## Task requirements
### Core task fields
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

### Task statuses
- To Do
- In Progress
- Review
- Revision
- Blocked
- Done

### Task categories
- Brief Review
- Reference Collection
- Modeling
- Drafting
- Calculation
- Checking
- BOQ
- Report Writing
- Revision
- Coordination
- Submission Prep
- Admin

### Tasks list columns
- Task
- Project
- Category
- Assigned To
- Reviewer
- Due Date
- Priority
- Status
- Progress

### Task UX
Support:
- create task
- edit task
- change status quickly
- assign or reassign
- update progress
- mark blocked with reason
- mark done
- filter by current user
- filter overdue
- filter due this week
- filter by status and project

## Deliverable requirements
### Core deliverable fields
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

### Deliverable types
- Drawing
- 3D Model
- Report
- BOQ
- Calculation Sheet
- Presentation
- Specification
- Revision Package
- Submission Package

### Deliverable statuses
- Draft
- Internal Review
- Ready to Submit
- Sent to Client
- Revision Requested
- Approved
- Final Issued

### Deliverables list columns
- Deliverable Name
- Project
- Type
- Rev
- Prepared By
- Status
- Submitted Date
- Approved Date
- File Link

### Deliverable UX
Must support:
- create deliverable
- edit deliverable
- increment or set revision number
- link to file
- record client feedback summary
- mark as sent to client
- mark as revision requested
- mark as approved/final issued

## File metadata requirements
### Core fields
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

### File categories
- Reference
- Draft
- Working File
- Review Copy
- Final
- Submission
- Supporting Document

## Project tabs requirements
### Tasks tab
Fully functional task table and actions.

### Deliverables tab
Fully functional deliverables table and actions.

### Files tab
Show:
- linked project folder if available
- attached file metadata rows
- open-link actions
- add file metadata action

## Revision workflow requirements
- deliverable revision number must be visible in list and detail UI
- revision requested status should stand out clearly
- if a deliverable enters Revision Requested, make it easy to create or reopen a related task
- naming and labels should prevent confusion

## UX rules
- avoid overwhelming the user with giant forms
- use drawers for task quick edit if it improves speed
- use detail pages if forms become too dense
- blocked tasks must be visually obvious
- overdue tasks must be clearly identifiable
- file links must be easy to click
- deliverable status transitions must be intuitive

## Automation / behavior
- when a task due date passes and status is not Done, it should appear overdue
- when deliverable status changes to Sent to Client, set submitted date if empty
- when deliverable status changes to Approved or Final Issued, preserve date logic cleanly
- if activity log exists, log important status transitions

## Required final output from AI for this stage
1. summary of task/deliverable/file features
2. changed files
3. migrations
4. explanation of revision handling
5. explanation of overdue/blocked logic
6. limitations around full Drive integration if not fully implemented
7. QA checklist
8. readiness statement for Stage 05

## Definition of done
This stage is done when:
- tasks can be created, updated, assigned, filtered, and tracked
- deliverables can be created, revised, and status-managed
- project detail page now supports real execution work
- file metadata and Drive links are visible and useful
- the app meaningfully supports active project operations
