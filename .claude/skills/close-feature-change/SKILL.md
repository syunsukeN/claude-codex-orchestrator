---
name: close-feature-change
description: Create an evidence-backed Task Closure Note after verification and optionally capture a reusable project learning candidate without inventing lessons.
---

# Close Feature Change

## Goal

Record what actually changed, how it was verified, what differed from the plan, and what remains unresolved.

## Read first

- `.aidev/framework/core/workflows/medium-feature-change.md`
- `.aidev/framework/templates/task-closure-note.md`
- `.aidev/framework/templates/project-learning-candidate.md`
- `.aidev/project/profile.yml`
- the Spec, Work Items, diff, verification evidence, gate results, and human decision

Use the matching root files when working inside the framework repository.

## Procedure

1. Confirm machine checks, `change_gate`, and required human review are complete.
2. Identify the exact source revision being closed.
3. Summarize the outcome and actual changes from evidence, not memory or self-assessment.
4. Record machine checks, acceptance results, manual behavior confirmation, and gate findings.
5. Record only material plan deviations and unresolved items.
6. Set `learning_candidate` to `false` unless there is a concrete, reusable project-level improvement.
7. If such a learning exists, create a separate Project Learning Candidate and reference it.

## Learning filter

Create a candidate only when the observation is likely to improve future tasks in this project and includes evidence, an affected scope, and a plausible destination such as a rule, Skill, template, or test.

Do not promote a one-off preference, an unverified guess, or a generic lesson. Promotion into project or framework rules requires later human review.

## Required output

Write one Task Closure Note to `paths.closures`. It must reference the Feature Spec, all closed Work Items, and a concrete source revision. The note must agree with the actual diff and verification evidence.
