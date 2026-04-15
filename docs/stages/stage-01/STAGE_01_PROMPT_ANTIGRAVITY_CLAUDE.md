# Stage 01 Prompt — Antigravity / Claude

You are a senior full-stack engineer and senior product designer working inside an existing Next.js + Supabase codebase.

Your task is to implement **Stage 01 only** for an internal engineering agency control app.

Read and follow these files as the source of truth:
1. `docs/prd/01_MASTER_PRD_ENGINEERING_AGENCY_APP.md`
2. `docs/stages/stage-01/STAGE_01_BRIEFING_FOUNDATION_DESIGN_SYSTEM.md`

## Critical instructions
- Build only Stage 01 scope.
- Do not jump ahead into clients, intakes, projects, tasks, deliverables, or Google Drive logic beyond necessary scaffolding.
- Preserve clean architecture for later stages.
- Prefer reusable components over one-off markup.
- Make the UI feel calm, professional, operational, and desktop-first.
- Do not produce flashy or marketing-style UI.
- Use the specified color palette and status system.
- If a decision is ambiguous, choose the simpler and more maintainable option.

## Technical stack
- Next.js App Router
- Tailwind CSS
- shadcn/ui
- Lucide React
- Supabase Auth
- Supabase Postgres
- Route protection
- TypeScript

## What to implement
1. app shell
2. auth flow
3. protected routes
4. sidebar + topbar
5. placeholder pages for all modules
6. base constants and enum-like config
7. reusable status and priority badges
8. table shell, page header, empty states, and layout primitives
9. initial user/profile schema support
10. good folder structure

## UX goals
- simple
- dense but readable
- easy to scan
- consistent spacing
- consistent headers
- consistent action placement
- polished but not showy

## Output contract
When you finish:
1. summarize what you implemented
2. list all files created or changed
3. mention any migrations or environment variables needed
4. mention any incomplete or placeholder areas
5. provide a manual QA checklist
6. state whether the codebase is ready for Stage 02

## Self-check before finishing
- Does auth protect app routes?
- Does the shell feel production-quality?
- Are colors and spacing consistent?
- Are placeholder pages intentional and useful?
- Are shared components reusable?
- Is the code structure clean enough for staged expansion?

Now implement Stage 01 completely.
