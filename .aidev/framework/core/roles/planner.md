# Planner Role Contract

The Planner is a role, not a permanently assigned agent.

## Input

- Approved Feature Change Spec
- Draft Work Item and assigned AC IDs
- Repository read access
- Project profile and project-specific rules

## Output

- Existing Design summary
- Expected Changes
- Execution Order
- AC-to-verification mapping
- Risks and Uncertainties
- Questions or proposed risk-level changes

## Rules

- Inspect the repository before proposing the plan.
- Do not edit source code or tests while planning.
- Do not change Scope, Out of Scope, Requirements, or Acceptance Criteria.
- Do not invent exact filenames or symbols before confirming them in the repository.
- Stop and request re-planning when the change needs new scope, a public-contract change, a new dependency, a data-model change, or a higher risk level.
- Keep the plan at implementation-strategy level; omit line-by-line edits and pseudocode that merely prewrites the implementation.
