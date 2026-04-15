# AI Usage Protocol — Antigravity and Claude

Use this file before starting any stage.

## How to run the build process
1. Open the codebase in Antigravity or Claude-enabled environment.
2. Provide:
   - `01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
   - the current stage briefing file
   - the current stage prompt file
3. Ask the AI to:
   - inspect the existing codebase first
   - restate the stage scope briefly
   - implement only the requested scope
   - keep a running list of touched files
   - run or describe validation steps before finishing
4. Review the output manually before moving to the next stage.

## One-stage rule
Never ask the AI to build multiple stages in one pass.
This product is intentionally staged to reduce drift, hallucinated architecture, and unnecessary complexity.

## Suggested operator workflow
For each stage:
1. paste the stage prompt
2. attach or include the stage briefing
3. let the AI inspect the codebase
4. let the AI implement
5. review changed files
6. test manually
7. only then move to next stage

## If the AI starts drifting
Stop and redirect it with:
- "Stay within the current stage only."
- "Do not add future-stage features."
- "Follow the PRD and stage briefing exactly."
- "Preserve the current architecture."
- "Keep UI simple, operational, and desktop-first."

## If the AI produces weak UI
Redirect with:
- "Use table-first UX for operational pages."
- "Reduce visual noise."
- "Tighten spacing hierarchy."
- "Keep badges and filters consistent."
- "Use the defined palette only."
- "Prefer drawers/modals for quick edits where appropriate."

## If the AI overengineers
Redirect with:
- "Choose the simpler maintainable solution."
- "Avoid speculative abstractions."
- "Do not introduce extra libraries unless essential."
- "Keep MVP scope tight."

## What you should review after each stage
- does the UI stay consistent?
- are actions easy to find?
- are forms easy to understand?
- are statuses clear?
- did the AI change unrelated areas?
- is the codebase still clean enough for next stage?

## Final note
The goal is not to make the AI do everything in one shot.
The goal is to make the AI produce a clean, staged, controllable build.
