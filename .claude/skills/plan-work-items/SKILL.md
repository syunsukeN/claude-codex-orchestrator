---
name: plan-work-items
description: Split an approved Feature Change Spec into independently verifiable Work Items and create a minimal repository-grounded Implementation Plan before editing code.
---

# Plan Work Items

## Goal

Produce small, reviewable Work Items that together cover every acceptance criterion, then plan each item from repository evidence.

## Read first

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/roles/planner.md`
- `.aidev/framework/templates/work-item.md`
- `.aidev/project/profile.yml`
- the approved Feature Change Spec

Use the matching root files when working inside the framework repository.

## Procedure

1. Confirm that `spec_gate` has passed. Do not silently repair an unapproved Spec.
2. Group ACs by an independently implementable and verifiable outcome, not by technical layer and not automatically one AC per item.
3. Give each Work Item one objective, assigned ACs, Scope, Out of Scope, dependencies, and verification mapping.
4. Ensure every AC is assigned and the dependency graph has no cycle.
5. Keep security and data-protection invariants in the same deliverable slice as the behavior they protect.
6. Inspect the repository read-only to understand existing design, conventions, interfaces, and tests.
7. Fill `Existing Design`, `Expected Changes`, `Execution Order`, `Verification`, and `Risks and Uncertainties`.
8. Stop before editing production code or tests.

## Re-plan when

Stop and return to the appropriate artifact if planning reveals:

- a required Scope change;
- a public API or data-model change not covered by the Spec;
- a new dependency;
- a higher risk level;
- a Work Item that cannot be verified independently.

Minor file-name or execution-order discoveries may be recorded later as Plan Amendments.

## Required output

Write Work Items to the project profile's `paths.work_items` directory. Each item must reference its Spec and AC IDs; do not copy the full AC text.
