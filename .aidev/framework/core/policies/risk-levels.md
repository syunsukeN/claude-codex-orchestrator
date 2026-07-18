# Risk Levels

RC1 implements and validates only the `medium` workflow.

| Level | RC1 status | Meaning |
|---|---|---|
| `low` | `defined_not_validated` | A small change with limited impact. The detailed workflow is deferred. |
| `medium` | `implemented` | A normal feature change that requires the full RC1 contract. |
| `high` | `defined_not_validated` | A change with serious impact or difficult recovery. Use stronger project-specific controls and human review; the detailed workflow is deferred. |

## Medium contract

```yaml
feature_spec: required
acceptance_criteria: required
spec_gate: required
implementation_plan: required
independent_verifier: required
acceptance_test_before_implementation: required
automated_verification: required
human_review: required
manual_behavior_check: required
closure_note: required
learning_candidate: optional
```

Authentication, authorization, payments, personal data, destructive data changes, public APIs, production infrastructure, and difficult-to-reverse migrations are high-risk indicators. RC1 records them but does not claim to implement a validated high-risk workflow.
