# RC1 Validation Findings

## Goal

Record observable problems found while using `ai-dev-framework v0.1.0-rc.1` without changing the installed snapshot during the experiment.

## FIND-RC1-001: Doctor cannot validate installation by itself

- Stage: installation
- Scope: framework-wide
- Severity: medium
- Evidence: lock, installed version, and both managed blocks passed, but doctor exited with failure because no Spec, Work Item, or Closure existed before the first task began.
- Impact: a user cannot distinguish a broken installation from a correctly installed but not-yet-executed workflow by exit status alone.
- Workaround: inspect the installation-related PASS results and treat artifact failures as expected until a feature run is closed.
- Candidate improvement: add an explicit `install` or `setup` stage to doctor while keeping the current closed-run validation as a separate stage.

## FIND-RC1-002: Empty AC sets produce misleading PASS messages

- Stage: installation
- Scope: framework-wide
- Severity: low
- Evidence: with zero Specs, doctor printed that every Spec AC was referenced by Work Items and test source.
- Impact: the output sounds complete even though there are no ACs to verify.
- Workaround: read the earlier `no Feature Change Specs` failure.
- Candidate improvement: skip AC comparison or report `not checked` when the expected AC set is empty.

## FIND-RC1-003: Evaluation files are not listed in the manual snapshot copy step

- Stage: installation
- Scope: framework-wide
- Severity: low
- Evidence: the installation guide lists core, templates, adapters, skills, and VERSION, while the real experiment also needs the RC1 evaluation checklist and doctor.
- Impact: a target project can be installed without the evidence checklist needed to judge the experiment.
- Workaround: include `eval/`, `docs/`, and `scripts/` in the fixed snapshot for this run.
- Candidate improvement: define one explicit snapshot manifest instead of describing directories in prose.

## FIND-RC1-004: Skill discovery copies create a large duplicated installation

- Stage: installation
- Scope: framework-wide
- Severity: medium
- Evidence: the installation adds 62 files and about 2,100 lines; each of the five Skills exists in the fixed snapshot, `.agents/skills/`, and `.claude/skills/`.
- Impact: initial review is noisy, and later manual updates can leave the three locations out of sync.
- Workaround: keep the RC1 copies byte-identical and verify them before committing.
- Candidate improvement: evaluate a generated distribution, supported symlinks, or thinner tool entrypoints after the first full feature run. Do not choose a replacement before testing discovery in both tools.

## FIND-RC1-005: Human-facing framework text is English-only

- Stage: installation and first-use review
- Scope: framework-wide
- Severity: medium
- Evidence: project settings, templates, Skill procedures, doctor messages, and evaluation documents are primarily English even though the project owner works in Japanese.
- Impact: the human reviewer needs extra effort to understand and correct the contract, which weakens the framework's goal of human-and-AI collaboration.
- Workaround: explain framework terms in Japanese during the experiment while leaving machine-defined identifiers unchanged.
- Candidate improvement: use Japanese for human-facing prose in Japanese projects, while keeping schema keys, paths, IDs, Skill names, commands, and required frontmatter fields in stable English. Decide later whether the common framework should ship localized variants or generate them from one semantic source.
