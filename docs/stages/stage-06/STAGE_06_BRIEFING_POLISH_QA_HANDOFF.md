# Stage 06 Briefing — Polish, QA, Hardening, Handoff

## Stage goal
Polish the product so it feels cohesive, reliable, and ready for real internal use.

## Mission
Implement final refinements across:
- UI consistency
- validation and error states
- loading states
- empty states
- QA cleanup
- responsive desktop/laptop sanity
- documentation and handoff

## In-scope deliverables
1. UI consistency pass across all modules
2. Improve loading and skeleton states
3. Improve empty states and success/error feedback
4. Tighten validation messages
5. Review button hierarchy and action placement
6. Review spacing and typography consistency
7. Fix awkward tables/forms
8. Improve detail page polish
9. Add concise README / setup docs if missing
10. Add seed/demo instructions if practical
11. Fix obvious bugs and rough edges found during manual QA
12. Ensure the app feels cohesive

## Out of scope
Do not start new major modules.
Do not add speculative features.
Do not redesign the whole product.
Do not bloat the codebase with unnecessary abstraction.

## UX polish checklist
- page headers consistent
- filter bars consistent
- button variants used consistently
- badges consistent
- empty states helpful
- forms easier to complete
- tables aligned and readable
- side spacing consistent
- sticky actions where they materially help
- text density comfortable on laptop screens

## Error and state handling
Improve:
- failed save states
- unauthorized access states
- empty list states
- no search results states
- loading states for major pages
- destructive action confirmations where needed

## QA expectations
Manually test:
- auth flow
- clients flow
- intakes flow
- intake conversion flow
- project flow
- task flow
- deliverable flow
- file linking
- dashboard and search

Fix issues found if they are clearly in-scope and high-value.

## Documentation deliverables
Create or update:
- root README
- environment variable guidance
- local setup instructions
- migration instructions
- stage completion summary
- known limitations / next steps

## Final product bar
The app should now feel:
- stable
- coherent
- simple to use
- polished enough for real internal operation
- not overengineered
- visually consistent

## Required final output from AI for this stage
1. summary of polish and fixes
2. file changes
3. documentation added or updated
4. list of bugs fixed
5. remaining limitations
6. final QA checklist
7. recommendations for post-MVP V2

## Definition of done
This stage is done when:
- the app feels cohesive
- common UX rough edges are reduced
- key flows are testable and understandable
- the product is ready for real MVP use and further iteration
