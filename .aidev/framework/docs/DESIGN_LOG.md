# RC1 Design Log

This log separates decisions from unverified beliefs so that a successful demo is not mistaken for proof.

## Decisions

- RC1 covers one medium-risk behavior-change workflow from requirements through closure. Low and high risk are described but not validated.
- Feature Change Spec is the change contract. Work Items contain minimal plans. Closure records actual results.
- Work Items are independently verifiable vertical outcomes and trace assigned AC IDs; they do not duplicate AC text.
- Planner, Implementer, and Verifier are roles, not a required number of agents.
- Verifier's `spec_gate`, `acceptance_test`, and `change_gate` run in fresh sessions.
- Acceptance tests are written and shown to fail for the intended reason before production implementation.
- Task Closure Note is required; Project Learning Candidate is optional.
- A project installs a fixed snapshot plus a lock file. Framework and application Git histories remain separate.
- Existing `AGENTS.md` and `CLAUDE.md` remain project-owned. Only a marked framework block is managed.
- Canonical Skills have one source and are copied to the discovery directories used by Codex and Claude.
- Doctor checks structure and traceability, not semantic correctness.

## Rejected for RC1

- Full CLI installer and automatic updater: maintenance cost precedes evidence of a stable layout. Reconsider after repeated manual installations.
- Automatic adapter generation: premature while the two entrypoints are short. Reconsider when duplication causes real drift.
- Required multiple models: model count is not a quality gate. Reconsider only with evaluation evidence for specific review tasks.
- Multi-agent orchestration: unnecessary for one sequential feature workflow. Reconsider for independently parallel work with measurable benefit.
- Separate Requirements, Technical Spec, and AC documents: synchronization cost is too high for the first small validation.
- Git submodule, subtree, or framework-history merge: more update and operator complexity than fixed copy for RC1.
- Mandatory learning artifact per task: encourages invented lessons.

## Assumptions

- A medium-risk feature is representative enough to expose the main handoff problems.
- Teams can create separate Verifier sessions even if they use the same model.
- Projects can tolerate copied Skill folders during RC1.
- AC IDs in tests provide useful structural traceability, while humans verify test meaning.
- The managed-block approach is understandable and does not create excessive instruction conflict.

## Open questions

- Is manual dual-copy of Skills acceptable in repeated installations?
- Are Feature Spec and Work Item templates short enough for normal use?
- Does a separate acceptance-test session create more value than overhead?
- Which doctor findings should become errors versus warnings?
- How should accepted Feature Change Specs update long-lived product documentation?
- Should the decision log later split into dedicated decision, assumption, validation, and change files?

## Validation items

- Complete the RC1 checklist in one sample project.
- Measure where the human must correct or repeat AI output.
- Seed at least one known inconsistency and verify that an independent gate detects it.
- Check that both Codex and Claude discover their installed Skills and project instructions.
- Update from one RC snapshot to the next without changing project-owned text.

## Change history

- `0.1.0-rc.1`: initial frozen contract for real-project validation.
