# Pre-Stage-7 Briefing — Dashboard Payment Snapshot Pass

## Purpose

The dashboard already has a stronger visual structure, but the owner/admin money signal should be checked before deployment hardening.
This pass exists to make the dashboard payment snapshot useful enough for daily overview.

This is not a broad dashboard redesign.
This is not a BI expansion.
This is a **small, targeted dashboard signal pass**.

## Required outcomes

### 1. Payment snapshot usefulness
The owner/admin should be able to quickly understand the payment situation from the dashboard.

### 2. Operational clarity
The snapshot should answer things like:
- how much is still outstanding?
- how many unpaid / partial items exist?
- is the section worth looking at daily?

### 3. Low-data quality
If payment data is sparse, the section should still feel intentional and not placeholder-like.

## Allowed improvements
- low-risk read-only aggregates
- better summary composition
- better labels / counts / outstanding presentation
- better fallback state
- better visual signal

## Not allowed
- do not redesign the whole dashboard again
- do not add heavy analytics
- do not add BI-style charts everywhere
- do not add accounting features
- do not add new modules

## Design guidance
- keep the section concise
- keep it calm and premium
- use approved palette only
- use Dark Wine only for true risk / outstanding emphasis
- keep it operational, not decorative

## Deliverable
At the end of this pass, the dashboard payment snapshot should feel useful enough for an owner/admin before deployment hardening.
