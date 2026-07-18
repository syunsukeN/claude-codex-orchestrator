---
name: define-feature-change
description: Turn an ambiguous feature request into a reviewable Feature Change Spec. Use before implementation when behavior, scope, acceptance criteria, verification, or risk must be agreed.
---

# Define Feature Change

## Goal

Create one Feature Change Spec that tells a human and an AI what outcome counts as correct without prescribing implementation details.

## Read first

From the project root, read these installed framework files when present:

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/core/policies/safety-baseline.md`
- `.aidev/framework/core/policies/risk-levels.md`
- `.aidev/framework/templates/feature-change-spec.md`
- `.aidev/project/profile.yml`

When developing the framework repository itself, use the matching files under `core/` and `templates/`.

## Procedure

1. Read the request and inspect only the repository evidence needed to understand current behavior.
2. Separate confirmed facts, human decisions, assumptions, and open questions.
3. Ask about one blocking decision at a time. Explain terms simply and state the immediate goal.
4. Write the change's background, objective, current behavior, Scope, and Out of Scope.
5. Express requirements and observable acceptance criteria with project-wide unique IDs.
6. Map every AC to a verification method. Cover normal, error, boundary, authorization, and relevant performance behavior.
7. Record the risk and uncertainty. Do not lower the safety baseline.
8. Stop before implementation planning or code changes.

## Required output

Save one Spec using the project profile's `paths.specs` directory and the Feature Change Spec template.

The Spec is ready for `spec_gate` only when:

- blocking questions are resolved;
- Scope and Out of Scope do not conflict;
- every AC is observable and testable;
- every AC has a verification strategy;
- requirements and AC IDs are unique;
- the stated risk is justified.

## Guardrails

- Do not invent missing product decisions.
- Do not hide uncertainty inside confident prose.
- Do not include file-by-file implementation steps or code design.
- Do not duplicate the same requirement in several slightly different ACs.
- Do not treat AI approval as human acceptance.
