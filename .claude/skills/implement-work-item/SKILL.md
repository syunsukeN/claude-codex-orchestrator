---
name: implement-work-item
description: Implement one approved Work Item from its Spec, plan, and already-failing acceptance tests, then provide machine-check evidence and explain material deviations.
---

# Implement Work Item

## Goal

Make the smallest maintainable change that satisfies the assigned acceptance criteria without widening the approved contract.

## Read first

- `.aidev/framework/core/roles/implementer.md`
- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/project/profile.yml`
- the approved Feature Change Spec and selected Work Item
- the pre-implementation acceptance-test evidence

Use the matching root files when working inside the framework repository.

## Preconditions

Do not begin production changes unless:

- `spec_gate` passed;
- the Work Item and Implementation Plan are approved;
- assigned ACs and verification are explicit;
- acceptance tests fail for the intended missing behavior;
- no blocking uncertainty remains.

## Procedure

1. Reproduce the expected failing acceptance tests.
2. Follow the repository's existing design and project-specific instructions.
3. Implement only the Work Item Scope and add focused lower-level tests when useful.
4. Run the assigned AC tests and project-configured machine checks.
5. Record material Plan Amendments and their reasons.
6. Report actual changes, commands and results, unresolved items, and evidence for the later gate.

## Stop and return for re-planning

Stop before continuing if implementation requires:

- changing an AC or Scope;
- changing a public API or data model unexpectedly;
- adding a dependency;
- crossing a project safety boundary;
- raising the risk level;
- acting on a production system.

Ordinary compile or test failures remain implementation work. Never weaken tests merely to make them pass.

## Completion boundary

Passing tests is not final approval. The output must still pass independent `change_gate`, human review, and manual behavior confirmation.
