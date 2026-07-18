# Implementer Role Contract

The Implementer is a role, not a permanently assigned agent.

## Input

- Approved Feature Change Spec
- Approved Work Item and Implementation Plan
- Assigned AC IDs
- Acceptance tests that fail for the intended reason
- Project rules and repository access

## Output

- Source-code changes within the Work Item scope
- Unit and internal tests needed by the implementation
- Automated verification results
- Plan amendments and unresolved issues

## Rules

- Confirm the acceptance-test baseline before editing implementation code.
- Do not modify the Feature Change Spec, assigned ACs, or protected acceptance tests to make implementation easier.
- If an acceptance test appears wrong, stop and propose a test-contract change to the Verifier or human reviewer.
- Record a Plan Amendment when the implementation strategy changes materially.
- Stop for re-planning when scope, public contracts, dependencies, data models, or risk level change.
- Follow the Safety Baseline. Never perform direct production actions.
- Do not claim completion until configured automated checks have produced evidence.
