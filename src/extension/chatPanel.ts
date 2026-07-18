import type { Project } from './projects';
import { runCodex, type SpawnLike } from './codexRunner';
import { runClaude } from './claudeRunner';
import { createThreadContext, buildPrompt, beginTurn, completeTurn, type ThreadContext } from './threadContext';
import type { HostToWebviewMessage, WebviewToHostMessage } from '../shared/messages';

export const CHAT_PANEL_VIEW_TYPE = 'claudeCodexOrchestrator.chatPanel';

export interface UriLike {
  readonly fsPath: string;
  readonly path: string;
  with(change: { path?: string }): UriLike;
  toString(): string;
}

export interface WebviewLike {
  html: string;
  readonly cspSource: string;
  asWebviewUri(uri: UriLike): UriLike;
  onDidReceiveMessage(listener: (message: unknown) => void): unknown;
  postMessage(message: unknown): unknown;
}

export interface WebviewPanelLike {
  readonly webview: WebviewLike;
  reveal(...args: unknown[]): void;
  dispose(): void;
  onDidDispose(listener: () => void): unknown;
}

export interface ChatPanelDeps {
  createWebviewPanel(
    viewType: string,
    title: string,
    showOptions: unknown,
    options?: unknown
  ): WebviewPanelLike;
  spawn: SpawnLike;
}

export interface ChatSession {
  codexThreadId: string | null;
  claudeSessionId: string | null;
  running: boolean;
  activeRun: { kill(): void } | null;
  context: ThreadContext;
}

export interface ChatPanelHandle {
  panel: WebviewPanelLike;
  session: ChatSession;
}

const EDITOR_VIEW_COLUMN_ONE = 1;

export function openChatPanel(
  deps: ChatPanelDeps,
  project: Project,
  extensionUri: UriLike
): ChatPanelHandle {
  const panel = deps.createWebviewPanel(
    CHAT_PANEL_VIEW_TYPE,
    `Chat: ${project.name}`,
    EDITOR_VIEW_COLUMN_ONE,
    {
      enableScripts: true,
      retainContextWhenHidden: true
    }
  );

  panel.webview.html = buildHtml(panel.webview, extensionUri, project);

  const session: ChatSession = {
    codexThreadId: null,
    claudeSessionId: null,
    running: false,
    activeRun: null,
    context: createThreadContext()
  };

  panel.webview.onDidReceiveMessage((message: unknown) => {
    handleWebviewMessage(deps, panel, project, session, message as WebviewToHostMessage);
  });

  panel.onDidDispose(() => {
    session.activeRun?.kill();
  });

  return { panel, session };
}

function handleWebviewMessage(
  deps: ChatPanelDeps,
  panel: WebviewPanelLike,
  project: Project,
  session: ChatSession,
  message: WebviewToHostMessage
): void {
  if (message.type !== 'sendMessage') {
    return;
  }

  if (session.running) {
    return;
  }

  const prompt = buildPrompt(session.context, message.ai, message.text);
  session.context = beginTurn(session.context, message.ai, message.text);
  session.running = true;

  if (message.ai === 'codex') {
    startCodexRun(deps, panel, project, session, prompt);
  } else {
    startClaudeRun(deps, panel, project, session, prompt);
  }
}

function startCodexRun(
  deps: ChatPanelDeps,
  panel: WebviewPanelLike,
  project: Project,
  session: ChatSession,
  prompt: string
): void {
  let lastAgentText: string | null = null;

  session.activeRun = runCodex(
    { spawn: deps.spawn },
    { prompt, cwd: project.path, resumeSessionId: session.codexThreadId ?? undefined },
    {
      onEvent(event) {
        if (event.type === 'thread.started') {
          session.codexThreadId = event.thread_id;
        }
        if (event.type === 'item.completed' && event.item.type === 'agent_message') {
          lastAgentText = event.item.text;
        }
        post(panel, { type: 'codexEvent', event });
      },
      onComplete() {
        session.running = false;
        session.activeRun = null;
        session.context = completeTurn(session.context, 'codex', lastAgentText);
        post(panel, { type: 'runCompleted' });
      },
      onError(errorMessage) {
        session.running = false;
        session.activeRun = null;
        session.context = completeTurn(session.context, 'codex', null);
        post(panel, { type: 'runFailed', message: errorMessage });
      }
    }
  );
}

function startClaudeRun(
  deps: ChatPanelDeps,
  panel: WebviewPanelLike,
  project: Project,
  session: ChatSession,
  prompt: string
): void {
  let finalText: string | null = null;

  session.activeRun = runClaude(
    { spawn: deps.spawn },
    { prompt, cwd: project.path, resumeSessionId: session.claudeSessionId ?? undefined },
    {
      onEvent(event) {
        if (event.type === 'system') {
          session.claudeSessionId = event.session_id;
        }
        if (event.type === 'result') {
          session.claudeSessionId = event.session_id;
          finalText = event.result ?? null;
        }
        post(panel, { type: 'claudeEvent', event });
      },
      onComplete() {
        session.running = false;
        session.activeRun = null;
        session.context = completeTurn(session.context, 'claude', finalText);
        post(panel, { type: 'runCompleted' });
      },
      onError(errorMessage) {
        session.running = false;
        session.activeRun = null;
        session.context = completeTurn(session.context, 'claude', null);
        post(panel, { type: 'runFailed', message: errorMessage });
      }
    }
  );
}

function post(panel: WebviewPanelLike, message: HostToWebviewMessage): void {
  panel.webview.postMessage(message);
}

function buildHtml(webview: WebviewLike, extensionUri: UriLike, project: Project): string {
  const scriptUri = webview.asWebviewUri(joinUri(extensionUri, 'dist', 'webview', 'main.js'));
  const styleUri = webview.asWebviewUri(joinUri(extensionUri, 'dist', 'webview', 'main.css'));
  const nonce = createNonce();

  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />
<link rel="stylesheet" href="${styleUri}" />
<title>Claude Codex Orchestrator</title>
</head>
<body>
<div id="app" data-project-id="${escapeHtml(project.id)}" data-project-name="${escapeHtml(project.name)}" data-project-path="${escapeHtml(project.path)}"></div>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
}

function joinUri(base: UriLike, ...segments: string[]): UriLike {
  return base.with({ path: `${base.path}/${segments.join('/')}` });
}

function createNonce(): string {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
