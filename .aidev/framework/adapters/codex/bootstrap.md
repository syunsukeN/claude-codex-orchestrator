# Codex Bootstrap

This adapter connects Codex to the installed framework without replacing project instructions.

## Discovery

- Keep project-specific instructions in the project's existing `AGENTS.md` files.
- Add only the provided managed block to the root `AGENTS.md`.
- Install universal Skills under `.agents/skills/<skill-name>/SKILL.md`.
- Keep the fixed framework snapshot under `.aidev/framework/`.

Codex has no framework-defined general Markdown import directive equivalent to Claude's `@path`. Therefore the managed `AGENTS.md` block contains the minimum always-on contract and points to Skills for task-specific detail.

## Precedence

Apply instructions in this order:

1. enforced permissions, sandboxing, and CI controls;
2. project-specific safety and development rules;
3. the framework safety baseline and workflow;
4. personal preferences.

Project rules may strengthen the safety baseline but must not weaken it. Remove contradictions rather than expecting the model to resolve them reliably.
