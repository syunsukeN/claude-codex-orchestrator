# Installation Baseline

## Goal

Confirm that `claude-codex-orchestrator` is healthy immediately after installing `ai-dev-framework v0.1.0-rc.1` and before creating the first Feature Change Spec.

## Source revisions

- Application base: `1bd0794` (`origin/main` at installation start)
- Framework: `a6f8769e5c47a7034ca68954a43795c3626e1d05`
- Framework version: `0.1.0-rc.1`

## Results

| Check | Result | Evidence |
|---|---|---|
| `npm run build` | passed | Extension and Webview production builds completed. |
| `npm run test:unit` | passed | 10 files and 143 tests passed. |
| `npm run test:integration` | passed | 3 VS Code extension integration tests passed. |
| doctor installation checks | passed | Lock, installed version, AGENTS managed block, and CLAUDE managed block passed. |
| doctor closed-run checks | not yet applicable | No Feature Spec, Work Item, or Closure exists before the first experiment. |

The first sandboxed integration-test attempt could not use the VS Code network/GUI environment and terminated. The same command passed outside that sandbox; this was an execution-environment limitation rather than a project failure.
