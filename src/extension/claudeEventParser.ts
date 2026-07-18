import type { ClaudeContentBlock, ClaudeEvent, ClaudeUsage } from '../shared/claudeEvents';
import { JsonlParser } from './jsonlParser';

function filterContentBlocks(content: unknown): ClaudeContentBlock[] {
  if (!Array.isArray(content)) {
    return [];
  }

  const blocks: ClaudeContentBlock[] = [];
  for (const raw of content) {
    if (typeof raw !== 'object' || raw === null || !('type' in raw)) {
      continue;
    }
    const record = raw as Record<string, unknown>;
    switch (record.type) {
      case 'text':
        blocks.push({ type: 'text', text: record.text as string });
        break;
      case 'tool_use':
        blocks.push({
          type: 'tool_use',
          id: record.id as string,
          name: record.name as string,
          input: record.input
        });
        break;
      case 'thinking':
        blocks.push({ type: 'thinking', thinking: record.thinking as string });
        break;
      default:
        break;
    }
  }
  return blocks;
}

export function parseClaudeEventLine(line: string): ClaudeEvent | null {
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
    case 'system': {
      if (record.subtype !== 'init') {
        return null;
      }
      return {
        type: 'system',
        subtype: 'init',
        session_id: record.session_id as string,
        model: record.model as string,
        tools: record.tools as string[]
      };
    }

    case 'assistant': {
      const message = record.message as Record<string, unknown> | undefined;
      return { type: 'assistant', message: { content: filterContentBlocks(message?.content) } };
    }

    case 'stream_event': {
      const event = record.event as Record<string, unknown> | undefined;
      if (!event || event.type !== 'content_block_delta') {
        return null;
      }
      const delta = event.delta as Record<string, unknown> | undefined;
      if (!delta || delta.type !== 'text_delta') {
        return null;
      }
      return {
        type: 'stream_event',
        event: { type: 'content_block_delta', delta: { type: 'text_delta', text: delta.text as string } }
      };
    }

    case 'result': {
      return {
        type: 'result',
        subtype: record.subtype as string,
        result: record.result as string | undefined,
        session_id: record.session_id as string,
        total_cost_usd: record.total_cost_usd as number | undefined,
        usage: record.usage as ClaudeUsage | undefined,
        duration_ms: record.duration_ms as number | undefined
      };
    }

    case 'user':
      return null;

    default:
      return null;
  }
}

export class ClaudeEventParser {
  private readonly delegate = new JsonlParser<ClaudeEvent>(parseClaudeEventLine);

  push(chunk: string): ClaudeEvent[] {
    return this.delegate.push(chunk);
  }

  flush(): ClaudeEvent[] {
    return this.delegate.flush();
  }
}
