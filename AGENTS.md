# Project Instructions

`CLAUDE.md` is the existing project-definition source. Read it before planning or implementing a change, including its technology stack, phased scope, TDD rules, and license constraints.

Use the commands defined in `package.json`. Do not edit generated files under `dist/` directly; update their sources and rebuild instead.

<!-- aidev-managed:start version=0.1.0-rc.1 -->

## AI Development Framework

Goal: make a behavior change traceable from an approved Spec to independent verification.

- Project-specific instructions take precedence over ordinary framework conventions.
- Project rules may strengthen, but never weaken, `.aidev/framework/core/policies/safety-baseline.md`.
- For behavior changes, use `.aidev/framework/core/workflows/medium-feature-change.md`.
- Use the task-specific Skills installed under `.agents/skills/`.
- Do not implement before the Spec, assigned Work Item, plan, and intentionally failing acceptance tests are ready.
- Run Verifier gates in fresh sessions; AI self-report is not completion evidence.
- Stop when Scope, contract, dependency, risk, or production-system authority changes.

<!-- aidev-managed:end -->
