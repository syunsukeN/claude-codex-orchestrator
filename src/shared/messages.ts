import type { CodexEvent } from './codexEvents';
import type { ClaudeEvent } from './claudeEvents';

export type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'sendMessage'; ai: 'codex' | 'claude'; text: string };

export type HostToWebviewMessage =
  | { type: 'init'; project: { id: string; name: string; path: string } }
  | { type: 'codexEvent'; event: CodexEvent }
  | { type: 'claudeEvent'; event: ClaudeEvent }
  | { type: 'runCompleted' }
  | { type: 'runFailed'; message: string };
