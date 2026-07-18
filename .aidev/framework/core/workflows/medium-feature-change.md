# Medium Feature Change Workflow

This is the only workflow implemented and validated by RC1. Roles do not imply three simultaneous agents; separate sessions may use the same model.

## Flow

```text
Request
  -> Feature Change Spec
  -> Verifier: spec_gate
  -> Work Item decomposition + verification design
  -> Planner: Implementation Plan
  -> Verifier: failing acceptance tests
  -> Implementer
  -> automated verification
  -> Verifier: change_gate
  -> human review and manual behavior check
  -> Task Closure Note
  -> optional Project Learning Candidate
```

## 1. Feature Change Spec

Input: ambiguous request, repository evidence, and human decisions.

Output: one approved Feature Change Spec with project-wide unique Requirement and AC IDs.

Exit conditions:

- Objective, Scope, and Out of Scope are explicit.
- Blocking questions are resolved.
- ACs are testable.
- Verification Strategy covers every AC.
- Risk is recorded as `medium`.

Return here when requirements, ACs, scope, or risk are unclear or changed.

## 2. `spec_gate`

Run the Verifier in a fresh session. Do not provide implementation plans or code.

Exit condition: no blocking findings remain and a human accepts the Spec contract.

Return to the Feature Change Spec for missing or conflicting behavior.

## 3. Work Items and verification design

Decompose by independently verifiable vertical change, not by technical layer or one Issue per AC.

Outputs:

- Every AC is assigned to at least one Work Item.
- Each Work Item has one objective, Scope, Out of Scope, dependencies, and a verification mapping.
- Cross-cutting safety invariants ship with the behavior they protect.
- No cyclic dependency or ambiguous verification responsibility remains.

Return to decomposition when a Work Item cannot be implemented and verified independently.

## 4. Implementation Plan

The Planner inspects the repository without editing implementation code, then fills the Work Item's plan sections.

Exit condition: the plan identifies existing design, expected changes, order, verification, and uncertainties without changing the Spec contract.

Return to the Work Item for plan corrections. Return to the Spec when the plan reveals a contract change.

## 5. Failing acceptance tests

Run the Verifier's `acceptance_test` execution in a fresh session.

Exit conditions:

- Tests reference their AC IDs.
- Every AC has a structural test reference.
- New tests fail before implementation.
- The failure is caused by missing behavior, not broken setup or syntax.

Return to the Spec for a wrong contract, Work Items for a wrong verification boundary, or tests for an incorrect failure.

## 6. Implementation

Run the Implementer with approved artifacts and the failing tests.

Exit conditions:

- Assigned AC tests pass.
- Project-configured build, lint, type-check, and test commands pass when applicable.
- Plan Amendments explain material deviations.
- No unresolved scope or risk increase remains.

Return to implementation for ordinary test failures. Stop and re-plan for scope, contract, dependency, data-model, or risk changes.

## 7. `change_gate`

Run the Verifier in another fresh session.

Exit conditions:

- Every AC has a supported pass/fail judgment.
- No blocking mismatch, missing test, unsafe partial state, or out-of-scope change remains.
- Verification evidence is available.

Return to the Spec, Work Item, tests, or Implementer according to the finding.

## 8. Human review and manual behavior check

The human confirms business intent, reviews material findings, and observes the feature behavior. AI self-report is not sufficient.

Exit condition: the human accepts the change or returns it to an earlier stage.

## 9. Task Closure Note

Create one closure snapshot that references the Spec, Work Items, source revision, verification, actual changes, deviations, findings, and unresolved items.

Return to the Closure Note when it does not match the evidence.

## 10. Optional Project Learning Candidate

Create a separate candidate only when the result contains a reusable project-level improvement. Do not manufacture a learning for every task. Formal promotion requires later human review.
