# RC1 Evaluation Checklist

## Goal

Determine whether the minimum medium-risk workflow is usable in a real project, including whether it detects a known mistake.

## Setup

- [ ] Record the framework version and commit from `framework.lock`.
- [ ] Record the sample application's starting revision.
- [ ] Confirm Codex sees the managed `AGENTS.md` instructions and installed Skills.
- [ ] Confirm Claude sees the managed `CLAUDE.md` import and installed Skills.
- [ ] Choose one small, medium-risk behavior change with at least one boundary or authorization condition.

## Required evidence

- [ ] An ambiguous request became a human-approved, testable Feature Change Spec.
- [ ] Every AC maps to at least one Work Item.
- [ ] Every AC appears in acceptance-test source.
- [ ] New acceptance tests failed before implementation for the intended reason.
- [ ] Implementation passed configured machine checks.
- [ ] Human review and manual behavior confirmation passed.
- [ ] An independent Verifier found at least one deliberately seeded Spec, test, or change inconsistency.
- [ ] The final Task Closure Note matches the source revision, diff, and verification evidence.
- [ ] Doctor passes after closure.

## Human burden

Choose one and explain the largest source of friction:

- [ ] Next time I would use it again.
- [ ] I would use it again after specific fixes.
- [ ] The burden is too high to use it again.

## Findings

Record each finding with its stage, observable evidence, severity, workaround, proposed destination, and whether it is project-specific or framework-wide. Do not edit the installed snapshot during the run unless the workflow is blocked.
