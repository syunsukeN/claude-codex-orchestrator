# Claude Adapter

The project's existing `CLAUDE.md` remains the source of project instructions. Add the managed block from `distribution/managed-blocks/CLAUDE.md`; it imports `bootstrap.md` from the installed snapshot.

Install the same canonical universal Skill folders used by Codex under `.claude/skills/`. Do not fork their content unless a model-specific difference has been observed and documented.

The import loads at startup, so `bootstrap.md` stays small. Detailed role procedures remain in Skills and are loaded for the relevant task.
