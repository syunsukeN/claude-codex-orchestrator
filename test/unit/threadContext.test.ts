import { describe, it, expect } from 'vitest';
import {
  createThreadContext,
  buildPrompt,
  beginTurn,
  completeTurn,
  type ThreadContext
} from '../../src/extension/threadContext';

describe('threadContext', () => {
  it('buildPrompt returns the userText unchanged when there is no delta', () => {
    const ctx = createThreadContext();

    expect(buildPrompt(ctx, 'codex', 'hello')).toBe('hello');
  });

  it('beginTurn pushes a new turn and sets seen[ai] to the length before the push', () => {
    const ctx = createThreadContext();

    const next = beginTurn(ctx, 'codex', 'do the thing');

    expect(next.turns).toHaveLength(1);
    expect(next.turns[0]).toEqual({ ai: 'codex', userText: 'do the thing', finalOutput: null });
    expect(next.seen).toEqual({ codex: 0, claude: 0 });
  });

  it('completeTurn records the final output on the last turn and sets seen[ai] to the new length', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'do the thing');

    const next = completeTurn(ctx, 'codex', 'done!');

    expect(next.turns[0]).toEqual({ ai: 'codex', userText: 'do the thing', finalOutput: 'done!' });
    expect(next.seen).toEqual({ codex: 1, claude: 0 });
  });

  it('injects the exact delta template when switching from codex to claude', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'ここを直して');
    ctx = completeTurn(ctx, 'codex', '直しました');

    const prompt = buildPrompt(ctx, 'claude', 'レビューして');

    expect(prompt).toBe(
      '【ここまでの経緯】\nユーザー→Codex: ここを直して\nCodex: 直しました\n【ユーザー入力】\nレビューして'
    );
  });

  it('uses "(応答なし)" when finalOutput is null', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'ここを直して');
    // no completeTurn: finalOutput stays null (failure case)

    const prompt = buildPrompt(ctx, 'claude', 'レビューして');

    expect(prompt).toBe(
      '【ここまでの経緯】\nユーザー→Codex: ここを直して\nCodex: (応答なし)\n【ユーザー入力】\nレビューして'
    );
  });

  it('does not inject context when the same ai sends consecutive turns', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'first');
    ctx = completeTurn(ctx, 'codex', 'first done');

    const prompt = buildPrompt(ctx, 'codex', 'second');

    expect(prompt).toBe('second');
  });

  it('accumulates two turns into the injected delta', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'first');
    ctx = completeTurn(ctx, 'codex', 'first done');
    ctx = beginTurn(ctx, 'codex', 'second');
    ctx = completeTurn(ctx, 'codex', 'second done');

    const prompt = buildPrompt(ctx, 'claude', 'go');

    expect(prompt).toBe(
      '【ここまでの経緯】\n' +
        'ユーザー→Codex: first\n' +
        'Codex: first done\n' +
        'ユーザー→Codex: second\n' +
        'Codex: second done\n' +
        '【ユーザー入力】\n' +
        'go'
    );
  });

  it('cross-delta: after claude consumes the codex delta, codex only sees the unread claude turn', () => {
    let ctx = createThreadContext();
    ctx = beginTurn(ctx, 'codex', 'first');
    ctx = completeTurn(ctx, 'codex', 'first done');

    // claude reads the codex delta
    const claudePrompt = buildPrompt(ctx, 'claude', 'review it');
    expect(claudePrompt).toBe(
      '【ここまでの経緯】\nユーザー→Codex: first\nCodex: first done\n【ユーザー入力】\nreview it'
    );
    ctx = beginTurn(ctx, 'claude', 'review it');
    ctx = completeTurn(ctx, 'claude', 'looks good');

    // now codex switches back: should only see claude's unread turn, not its own already-seen turn
    const codexPrompt = buildPrompt(ctx, 'codex', 'apply the fix');
    expect(codexPrompt).toBe(
      '【ここまでの経緯】\nユーザー→Claude: review it\nClaude: looks good\n【ユーザー入力】\napply the fix'
    );
  });

  it('is immutable: createThreadContext/beginTurn/completeTurn never mutate their input', () => {
    const ctx0 = createThreadContext();
    const ctx1 = beginTurn(ctx0, 'codex', 'a');
    const ctx2 = completeTurn(ctx1, 'codex', 'b');

    expect(ctx0.turns).toEqual([]);
    expect(ctx1.turns).toHaveLength(1);
    expect(ctx1.turns[0].finalOutput).toBeNull();
    expect(ctx2).not.toBe(ctx1);
    expect(ctx2.turns).not.toBe(ctx1.turns);

    const frozenCheck: ThreadContext = ctx0;
    expect(frozenCheck.seen).toEqual({ codex: 0, claude: 0 });
  });
});
