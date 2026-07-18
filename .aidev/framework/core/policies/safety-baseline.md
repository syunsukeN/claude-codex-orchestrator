# Safety Baseline

This is the non-weakenable safety floor for RC1. Project rules may add stricter controls but must not relax these rules.

## AI may

- Inspect repositories and documentation.
- Draft specifications, work items, plans, tests, code changes, and runbooks.
- Edit files inside an authorized workspace.
- Run local or isolated verification that does not affect production.
- Prepare pull-request content and release instructions.

## AI must not

- Deploy directly to production.
- Write to a production database or apply a production migration.
- Retrieve, reveal, rotate, or modify production secrets.
- Execute real payments, refunds, or bulk customer messages.
- Change production privileges or production infrastructure.
- Push directly to a protected branch.
- Treat its own completion statement as verification evidence.

When a task reaches one of these boundaries, stop the AI-executed action and prepare a human runbook instead.

## Required evidence

- Automated checks must provide command output or CI evidence.
- Human decisions must identify the decision and its owner.
- Exceptions must be explicit, task-scoped, and recorded. An exception cannot permit direct AI production action in RC1.
