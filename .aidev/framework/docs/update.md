# Manual update for RC1

## Goal

Move a target project to a new fixed framework version without overwriting project-owned instructions or hiding local changes.

## Rules

1. Start from a clean project branch and record the current lock file.
2. Compare the installed `.aidev/framework/` snapshot with the current locked release. If it has local changes, stop and classify them before updating.
3. Replace only `.aidev/framework/` with the new release snapshot.
4. Refresh `.agents/skills/` and `.claude/skills/` from the new canonical Skill folders.
5. Update only content between the managed markers in `AGENTS.md` and `CLAUDE.md`. Never modify text outside those markers.
6. Update the version, commit, installation date, and managed-block hashes in `framework.lock`.
7. Run doctor and one small evaluation case before normal use.

If a managed block differs from the value recorded in the lock, do not overwrite it automatically. Show the difference and require a human decision.
