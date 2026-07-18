---
name: verify-feature-change
description: Run an independent spec gate, write pre-implementation acceptance tests, or review a completed change against its approved contract in a fresh session.
---

# Verify Feature Change

## Goal

Independently test the contract and evidence without inheriting the Implementer's assumptions.

## Choose exactly one execution

Use one fresh session for each execution:

- `spec_gate`: review the Spec before Work Item planning.
- `acceptance_test`: create tests before production implementation and prove they fail for the intended reason.
- `change_gate`: review the completed diff and evidence without fixing it.

Read:

- `.aidev/framework/core/roles/verifier.md`
- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/project/profile.yml`

Use the matching root files when working inside the framework repository.

## `spec_gate`

Review only the Spec, project profile, relevant existing behavior, and public interfaces. Do not accept implementation plans, code changes, or Implementer self-evaluation as input.

Return `pass` or `fail`, blocking findings with evidence, non-blocking findings, and missing ACs or questions.

## `acceptance_test`

Read the approved Spec and Work Items. Follow existing test conventions and write acceptance or contract tests containing their AC IDs.

Run the new tests before implementation. Record that each fails because behavior is missing. Setup, syntax, environment, and unrelated failures do not count.

Do not implement production behavior or change the contract to fit the code.

## `change_gate`

Read the approved contract, Work Items, plans, tests, implementation diff, machine-check results, and Plan Amendments.

Return:

- `pass` or `fail`;
- findings ordered by severity with evidence;
- an AC-by-AC coverage and result table;
- missing tests, Scope violations, unexplained deviations, or risk changes;
- the stage each blocking finding must return to.

Do not edit the implementation during this gate.

## Independence rule

A different model is optional. A fresh context and a critical evidence-based review are required. More agents or models do not by themselves provide quality assurance.
