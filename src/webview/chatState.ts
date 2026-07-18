import type { CodexEvent, CodexUsage, FileChangeEntry } from '../shared/codexEvents';
import type { ClaudeEvent } from '../shared/claudeEvents';

export type CommandStatus = 'in_progress' | 'completed' | 'failed';

const TOOL_INPUT_SUMMARY_MAX_LENGTH = 100;

export type ChatMessage =
  | { kind: 'user'; text: string }
  | { kind: 'agent'; text: string; streaming?: boolean }
  | {
      kind: 'command';
      itemId: string;
      command: string;
      status: CommandStatus;
      exitCode: number | null;
      output: string;
    }
  | { kind: 'fileChange'; changes: FileChangeEntry[] }
  | { kind: 'error'; message: string }
  | { kind: 'turnCompleted'; usage: CodexUsage }
  | { kind: 'toolUse'; toolUseId: string; name: string; inputSummary: string }
  | { kind: 'warning'; message: string };

export function applyCodexEvent(messages: ChatMessage[], event: CodexEvent): ChatMessage[] {
  switch (event.type) {
    case 'thread.started':
    case 'turn.started':
    case 'turn.failed':
    case 'error':
      return messages;

    case 'turn.completed':
      return [...messages, { kind: 'turnCompleted', usage: event.usage }];

    case 'item.started':
    case 'item.updated':
    case 'item.completed': {
      const item = event.item;

      switch (item.type) {
        case 'command_execution': {
          const upserted: ChatMessage = {
            kind: 'command',
            itemId: item.id,
            command: item.command,
            status: item.status,
            exitCode: item.exit_code,
            output: item.aggregated_output
          };
          const index = messages.findIndex((m) => m.kind === 'command' && m.itemId === item.id);
          if (index === -1) {
            return [...messages, upserted];
          }
          const next = messages.slice();
          next[index] = upserted;
          return next;
        }

        case 'agent_message':
          if (event.type !== 'item.completed') {
            return messages;
          }
          return [...messages, { kind: 'agent', text: item.text }];

        case 'file_change':
          if (event.type !== 'item.completed') {
            return messages;
          }
          return [...messages, { kind: 'fileChange', changes: item.changes }];

        case 'error':
          if (event.type !== 'item.completed') {
            return messages;
          }
          return [...messages, { kind: 'error', message: item.message }];

        case 'reasoning':
        case 'mcp_tool_call':
        case 'web_search':
        case 'todo_list':
        default:
          return messages;
      }
    }

    default:
      return messages;
  }
}

function summarizeToolInput(input: unknown): string {
  return JSON.stringify(input).slice(0, TOOL_INPUT_SUMMARY_MAX_LENGTH);
}

export function applyClaudeEvent(messages: ChatMessage[], event: ClaudeEvent): ChatMessage[] {
  switch (event.type) {
    case 'system':
      return messages;

    case 'stream_event': {
      const text = event.event.delta.text;
      const last = messages[messages.length - 1];
      if (last && last.kind === 'agent' && last.streaming) {
        const next = messages.slice();
        next[next.length - 1] = { kind: 'agent', text: last.text + text, streaming: true };
        return next;
      }
      return [...messages, { kind: 'agent', text, streaming: true }];
    }

    case 'assistant': {
      let next = messages;
      for (const block of event.message.content) {
        if (block.type === 'tool_use') {
          next = [
            ...next,
            {
              kind: 'toolUse',
              toolUseId: block.id,
              name: block.name,
              inputSummary: summarizeToolInput(block.input)
            }
          ];
        }
      }
      return next;
    }

    case 'result': {
      const wasStreamed = messages.some((m) => m.kind === 'agent' && m.streaming);
      let next: ChatMessage[];
      if (wasStreamed) {
        next = messages.map((m) => (m.kind === 'agent' && m.streaming ? { kind: 'agent', text: m.text, streaming: false } : m));
      } else {
        next = [...messages, { kind: 'agent', text: event.result ?? '' }];
      }
      if (event.subtype !== 'success') {
        next = [...next, { kind: 'warning', message: `Claude が正常に完了しませんでした (${event.subtype})` }];
      }
      return next;
    }

    default:
      return messages;
  }
}
