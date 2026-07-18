import { describe, it, expect, beforeEach } from 'vitest';
import sinon from 'sinon';
import { openChatPanel, CHAT_PANEL_VIEW_TYPE, type UriLike } from '../../src/extension/chatPanel';
import type { Project } from '../../src/extension/projects';
import type { SpawnLike } from '../../src/extension/codexRunner';
import { FakeChildProcess } from './helpers/fakeChildProcess';

function createFakeUri(path: string): UriLike {
  return {
    fsPath: path,
    path,
    with(change: { path?: string }) {
      return createFakeUri(change.path ?? path);
    },
    toString() {
      return `fake://${path}`;
    }
  };
}

function createFakeWebview() {
  return {
    html: '',
    cspSource: 'vscode-webview://fake',
    onDidReceiveMessage: sinon.stub(),
    postMessage: sinon.stub().resolves(true),
    asWebviewUri: sinon.stub().callsFake((uri: UriLike) => uri)
  };
}

function createFakePanel() {
  return {
    webview: createFakeWebview(),
    reveal: sinon.stub(),
    dispose: sinon.stub(),
    onDidDispose: sinon.stub()
  };
}

describe('openChatPanel', () => {
  let createWebviewPanel: sinon.SinonStub;
  let spawn: sinon.SinonStub;
  let child: FakeChildProcess;
  const project: Project = { id: '/a/b', name: 'b', path: '/a/b' };
  const extensionUri = createFakeUri('/ext');

  beforeEach(() => {
    createWebviewPanel = sinon.stub().returns(createFakePanel());
    child = new FakeChildProcess();
    spawn = sinon.stub().returns(child) as unknown as sinon.SinonStub;
  });

  function deps() {
    return { createWebviewPanel, spawn: spawn as unknown as SpawnLike };
  }

  it('calls createWebviewPanel exactly once', () => {
    openChatPanel(deps(), project, extensionUri);

    expect(createWebviewPanel.callCount).toBe(1);
  });

  it('passes CHAT_PANEL_VIEW_TYPE as the first argument', () => {
    openChatPanel(deps(), project, extensionUri);

    const firstArg = createWebviewPanel.firstCall.args[0];
    expect(firstArg).toBe(CHAT_PANEL_VIEW_TYPE);
  });

  it('sets non-empty html on the created panel webview', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);

    expect(panel.webview.html.length).toBeGreaterThan(0);
  });

  it('registers an onDidReceiveMessage listener on the panel webview', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);

    expect((panel.webview.onDidReceiveMessage as sinon.SinonStub).callCount).toBe(1);
  });

  it('spawns codex with the prompt and project cwd when sendMessage(codex) is received', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'do it' });

    expect(spawn.callCount).toBe(1);
    const [command, args, options] = spawn.firstCall.args;
    expect(command).toBe('codex');
    expect(args).toEqual(['exec', '--json', 'do it']);
    expect(options).toEqual({ cwd: '/a/b' });
  });

  it('captures thread_id from a thread.started event and posts codexEvent for each event', () => {
    const { panel, session } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'do it' });
    child.stdout.emit('data', '{"type":"thread.started","thread_id":"tid-1"}\n');

    expect(session.codexThreadId).toBe('tid-1');
    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    expect(postMessage.calledWith({ type: 'codexEvent', event: { type: 'thread.started', thread_id: 'tid-1' } })).toBe(
      true
    );
  });

  it('posts runCompleted and clears running when the process closes with code 0', () => {
    const { panel, session } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'do it' });
    child.emit('close', 0);

    expect(session.running).toBe(false);
    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    expect(postMessage.calledWith({ type: 'runCompleted' })).toBe(true);
  });

  it('posts runFailed and clears running when the process closes with a non-zero code', () => {
    const { panel, session } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'do it' });
    child.emit('close', 1);

    expect(session.running).toBe(false);
    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    expect(postMessage.lastCall.args[0].type).toBe('runFailed');
  });

  it('ignores a second sendMessage while a run is already in progress', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'first' });
    listener({ type: 'sendMessage', ai: 'codex', text: 'second' });

    expect(spawn.callCount).toBe(1);
  });

  it('spawns claude with the prompt and project cwd when sendMessage(claude) is received', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'claude', text: 'review it' });

    expect(spawn.callCount).toBe(1);
    const [command, args, options] = spawn.firstCall.args;
    expect(command).toBe('claude');
    expect(args).toEqual([
      '-p',
      '--output-format',
      'stream-json',
      '--include-partial-messages',
      '--verbose',
      'review it'
    ]);
    expect(options).toEqual({ cwd: '/a/b' });
  });

  it('captures session_id from a system init event and posts claudeEvent for each event', () => {
    const { panel, session } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'claude', text: 'review it' });
    child.stdout.emit(
      'data',
      '{"type":"system","subtype":"init","session_id":"sess-1","model":"claude-sonnet-4","tools":["Bash"]}\n'
    );

    expect(session.claudeSessionId).toBe('sess-1');
    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    expect(
      postMessage.calledWith({
        type: 'claudeEvent',
        event: {
          type: 'system',
          subtype: 'init',
          session_id: 'sess-1',
          model: 'claude-sonnet-4',
          tools: ['Bash']
        }
      })
    ).toBe(true);
  });

  it('posts runCompleted when a claude result event is followed by close(0)', () => {
    const { panel, session } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'claude', text: 'review it' });
    child.stdout.emit(
      'data',
      '{"type":"result","subtype":"success","result":"looks good","session_id":"sess-1"}\n'
    );
    child.emit('close', 0);

    expect(session.running).toBe(false);
    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    expect(postMessage.calledWith({ type: 'runCompleted' })).toBe(true);
  });

  it('resumes claude with --resume sessionId on the second send', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'claude', text: 'first' });
    child.stdout.emit(
      'data',
      '{"type":"result","subtype":"success","result":"ok","session_id":"sess-1"}\n'
    );
    child.emit('close', 0);

    const secondChild = new FakeChildProcess();
    spawn.returns(secondChild);
    listener({ type: 'sendMessage', ai: 'claude', text: 'second' });

    expect(spawn.callCount).toBe(2);
    const [, args] = spawn.secondCall.args;
    expect(args).toEqual([
      '-p',
      '--output-format',
      'stream-json',
      '--include-partial-messages',
      '--verbose',
      '--resume',
      'sess-1',
      'second'
    ]);
  });

  it('resumes codex with exec resume on the second send', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'first' });
    child.stdout.emit('data', '{"type":"thread.started","thread_id":"tid-1"}\n');
    child.emit('close', 0);

    const secondChild = new FakeChildProcess();
    spawn.returns(secondChild);
    listener({ type: 'sendMessage', ai: 'codex', text: 'second' });

    expect(spawn.callCount).toBe(2);
    const [, args] = spawn.secondCall.args;
    expect(args).toEqual(['exec', 'resume', '--json', 'tid-1', 'second']);
  });

  it('does not inject context for consecutive sends by the same ai', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'first' });
    child.stdout.emit('data', '{"type":"thread.started","thread_id":"tid-1"}\n');
    child.stdout.emit(
      'data',
      '{"type":"item.completed","item":{"id":"item_1","type":"agent_message","text":"first done"}}\n'
    );
    child.emit('close', 0);

    const secondChild = new FakeChildProcess();
    spawn.returns(secondChild);
    listener({ type: 'sendMessage', ai: 'codex', text: 'second' });

    const [, args] = spawn.secondCall.args;
    expect(args).toEqual(['exec', 'resume', '--json', 'tid-1', 'second']);
  });

  it('injects the Codex->Claude context template as the prompt on the second send, without posting it to the webview', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];

    listener({ type: 'sendMessage', ai: 'codex', text: 'ここを直して' });
    child.stdout.emit(
      'data',
      '{"type":"item.completed","item":{"id":"item_1","type":"agent_message","text":"直しました"}}\n'
    );
    child.emit('close', 0);

    const secondChild = new FakeChildProcess();
    spawn.returns(secondChild);
    listener({ type: 'sendMessage', ai: 'claude', text: 'レビューして' });

    expect(spawn.callCount).toBe(2);
    const [command, args] = spawn.secondCall.args;
    expect(command).toBe('claude');
    const prompt = args[args.length - 1];
    expect(prompt).toBe(
      '【ここまでの経緯】\nユーザー→Codex: ここを直して\nCodex: 直しました\n【ユーザー入力】\nレビューして'
    );

    const postMessage = panel.webview.postMessage as sinon.SinonStub;
    const postedPrompts = postMessage.getCalls().map((call) => JSON.stringify(call.args[0]));
    expect(postedPrompts.some((p) => p.includes('ここまでの経緯'))).toBe(false);
  });

  it('kills the active run when the panel is disposed', () => {
    const { panel } = openChatPanel(deps(), project, extensionUri);
    const listener = (panel.webview.onDidReceiveMessage as sinon.SinonStub).firstCall.args[0];
    listener({ type: 'sendMessage', ai: 'codex', text: 'do it' });

    const onDidDispose = panel.onDidDispose as sinon.SinonStub;
    const disposeListener = onDidDispose.firstCall.args[0];
    disposeListener();

    expect(child.kill.callCount).toBe(1);
  });
});
