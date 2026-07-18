import type { CodexEvent, CodexItem, CodexUsage } from '../shared/codexEvents';
import { JsonlParser } from './jsonlParser';

const KNOWN_ITEM_TYPES: ReadonlySet<CodexItem['type']> = new Set([
  'agent_message',
  'reasoning',
  'command_execution',
  'file_change',
  'mcp_tool_call',
  'web_search',
  'todo_list',
  'error'
]);

export function parseCodexEventLine(line: string): CodexEvent | null {
  const trimmed = line.trim();
  if (trimmed.length === 0) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null || !('type' in parsed)) {
    return null;
  }

  const record = parsed as Record<string, unknown>;

  switch (record.type) {
    case 'thread.started':
      return { type: 'thread.started', thread_id: record.thread_id as string };
    case 'turn.started':
      return { type: 'turn.started' };
    case 'turn.completed':
      return { type: 'turn.completed', usage: record.usage as CodexUsage };
    case 'turn.failed':
      return { type: 'turn.failed', error: record.error as { message: string } };
    case 'error':
      return { type: 'error', message: record.message as string };
    case 'item.started':
    case 'item.updated':
    case 'item.completed': {
      const item = record.item as Record<string, unknown> | undefined;
      if (!item || typeof item.type !== 'string' || !KNOWN_ITEM_TYPES.has(item.type as CodexItem['type'])) {
        return null;
      }
      return { type: record.type, item: item as unknown as CodexItem };
    }
    default:
      return null;
  }
}

export class CodexEventParser {
  private readonly delegate = new JsonlParser<CodexEvent>(parseCodexEventLine);

  push(chunk: string): CodexEvent[] {
    return this.delegate.push(chunk);
  }

  flush(): CodexEvent[] {
    return this.delegate.flush();
  }
}
