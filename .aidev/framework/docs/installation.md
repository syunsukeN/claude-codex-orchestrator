# Manual installation for RC1

## Goal

Install a fixed, traceable framework snapshot without merging framework Git history into the target project or replacing its instructions.

## Install

From a checkout or release archive of this repository:

1. Copy `core/`, `templates/`, `adapters/`, `skills/`, and `VERSION` into the target's `.aidev/framework/` directory.
2. Copy `distribution/project/.aidev/` into the target, preserving any existing project files.
3. Replace every placeholder in `.aidev/framework.lock` and `.aidev/project/profile.yml`.
4. Copy each folder under `.aidev/framework/skills/universal/` into both `.agents/skills/` and `.claude/skills/`.
5. If `AGENTS.md` or `CLAUDE.md` does not exist, create it with the matching managed block. If it exists, append only the managed block without changing content outside it.
6. Resolve contradictions between existing project instructions and the framework before use.
7. Copy `scripts/doctor` from the framework repository to a suitable project tool location, or run it directly with the target project path.
8. Run `scripts/doctor /path/to/target-project`.

Do not copy the entire framework repository over the target. Do not create a framework-owned `AGENTS.override.md`.

## Expected target shape

```text
target-project/
├── .aidev/
│   ├── framework/
│   ├── project/profile.yml
│   ├── framework.lock
│   ├── specs/
│   ├── work-items/
│   └── closures/
├── .agents/skills/
├── .claude/skills/
├── AGENTS.md
└── CLAUDE.md
```

RC1 intentionally uses manual copy. An installer or update CLI is deferred until this layout succeeds in a real project.
