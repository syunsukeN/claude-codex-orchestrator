export interface CodexUsage {
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
}

export interface FileChangeEntry {
  path: string;
  kind: 'add' | 'delete' | 'update';
}

export interface TodoListEntry {
  text: string;
  completed: boolean;
}

export type CodexItem =
  | { id: string; type: 'agent_message'; text: string }
  | { id: string; type: 'reasoning'; text: string }
  | {
      id: string;
      type: 'command_execution';
      command: string;
      aggregated_output: string;
      exit_code: number | null;
      status: 'in_progress' | 'completed' | 'failed';
    }
  | { id: string; type: 'file_change'; changes: FileChangeEntry[]; status: 'in_progress' | 'completed' | 'failed' }
  | {
      id: string;
      type: 'mcp_tool_call';
      server: string;
      tool: string;
      arguments: unknown;
      result: unknown;
      error: unknown;
      status: 'in_progress' | 'completed' | 'failed';
    }
  | { id: string; type: 'web_search'; query: string }
  | { id: string; type: 'todo_list'; items: TodoListEntry[] }
  | { id: string; type: 'error'; message: string };

export type CodexEvent =
  | { type: 'thread.started'; thread_id: string }
  | { type: 'turn.started' }
  | { type: 'turn.completed'; usage: CodexUsage }
  | { type: 'turn.failed'; error: { message: string } }
  | { type: 'error'; message: string }
  | { type: 'item.started' | 'item.updated' | 'item.completed'; item: CodexItem };

const RECONNECTING_PATTERN = /^Reconnecting\.\.\.\s*\d+\/\d+$/;

export function isNonFatalReconnectError(message: string): boolean {
  return RECONNECTING_PATTERN.test(message);
}
