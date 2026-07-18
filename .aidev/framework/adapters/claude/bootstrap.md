# AI Development Framework Bootstrap

Use the installed medium-risk Feature Change workflow for behavior changes.

Always apply:

- Project-specific instructions take precedence over ordinary framework conventions.
- Project rules may strengthen, but never weaken, `.aidev/framework/core/policies/safety-baseline.md`.
- Read only the workflow and Skill files needed for the current stage.
- Do not implement before the Spec, assigned Work Item, plan, and failing acceptance-test evidence are ready.
- Run `spec_gate`, `acceptance_test`, and `change_gate` in fresh sessions as defined by the Verifier contract.
- AI self-report is not completion evidence; machine checks and human review are required.
- Stop when Scope, contract, dependency, risk, or production-system authority changes.

Universal Skills are installed under `.claude/skills/`. The fixed source snapshot is under `.aidev/framework/`.
