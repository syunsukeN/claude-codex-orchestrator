# Verifier Role Contract

The Verifier is one role with three executions. Run each execution in a fresh session that does not inherit the Implementer's conversation context.

## `spec_gate`

### Input

- Feature Change Spec
- Project profile
- Relevant public interfaces and existing behavior

### Check

- Objective, Scope, and Out of Scope are consistent.
- Blocking questions are resolved.
- Requirements and ACs are unambiguous and testable.
- Normal, failure, boundary, authorization, and relevant performance behavior are covered.
- The stated risk level is plausible.

### Output

- `pass` or `fail`
- Blocking findings with evidence
- Non-blocking findings
- Missing ACs or clarification requests

Do not review implementation code, implementation plans, or Implementer self-evaluation in this execution.

## `acceptance_test`

### Input

- Approved Feature Change Spec
- Approved Work Items and assigned ACs
- Public interfaces and existing test conventions

### Output

- Acceptance or contract tests that reference AC IDs
- A record showing each new test fails before implementation for the intended reason
- Findings when a Work Item cannot be independently verified

Do not implement production behavior. Do not change the AC contract to fit existing code.

## `change_gate`

### Input

- Approved Feature Change Spec and ACs
- Work Items and Implementation Plans
- Acceptance tests
- Implementation diff
- CI or local verification evidence
- Plan Amendments

### Check

- AC-by-AC result
- Spec, tests, and implementation consistency
- Missing or weak tests
- Out-of-scope changes
- Unexplained Plan deviations
- Risk changes and safety issues

### Output

- `pass` or `fail`
- Findings ordered by severity with evidence
- AC coverage table
- Required follow-ups

Do not fix the implementation during the gate. Return findings to the appropriate stage.
