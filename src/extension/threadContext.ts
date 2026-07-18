export type AiKind = 'codex' | 'claude';

export interface Turn {
  ai: AiKind;
  userText: string;
  finalOutput: string | null;
}

export interface ThreadContext {
  turns: Turn[];
  seen: { codex: number; claude: number };
}

const AI_LABEL: Record<AiKind, string> = { codex: 'Codex', claude: 'Claude' };

export function createThreadContext(): ThreadContext {
  return { turns: [], seen: { codex: 0, claude: 0 } };
}

export function buildPrompt(ctx: ThreadContext, ai: AiKind, userText: string): string {
  const delta = ctx.turns.slice(ctx.seen[ai]);
  if (delta.length === 0) {
    return userText;
  }

  const lines: string[] = ['【ここまでの経緯】'];
  for (const turn of delta) {
    const label = AI_LABEL[turn.ai];
    lines.push(`ユーザー→${label}: ${turn.userText}`);
    lines.push(`${label}: ${turn.finalOutput ?? '(応答なし)'}`);
  }
  lines.push('【ユーザー入力】');
  lines.push(userText);

  return lines.join('\n');
}

export function beginTurn(ctx: ThreadContext, ai: AiKind, userText: string): ThreadContext {
  const seen = { ...ctx.seen, [ai]: ctx.turns.length };
  const turns = [...ctx.turns, { ai, userText, finalOutput: null }];
  return { turns, seen };
}

export function completeTurn(ctx: ThreadContext, ai: AiKind, finalOutput: string | null): ThreadContext {
  const turns = ctx.turns.slice();
  const lastIndex = turns.length - 1;
  turns[lastIndex] = { ...turns[lastIndex], finalOutput };
  const seen = { ...ctx.seen, [ai]: turns.length };
  return { turns, seen };
}
