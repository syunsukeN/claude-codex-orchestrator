import { describe, it, expect, beforeEach } from 'vitest';
import sinon from 'sinon';
import { runClaude } from '../../src/extension/claudeRunner';
import type { SpawnLike } from '../../src/extension/codexRunner';
import type { ClaudeEvent } from '../../src/shared/claudeEvents';
import { FakeChildProcess } from './helpers/fakeChildProcess';

function createDeps() {
  const child = new FakeChildProcess();
  const spawn: SpawnLike = sinon.stub().returns(child) as unknown as SpawnLike;
  return { child, spawn };
}

function createCallbacks() {
  return {
    onEvent: sinon.stub<[ClaudeEvent], void>(),
    onComplete: sinon.stub(),
    onError: sinon.stub<[string], void>()
  };
}

describe('runClaude', () => {
  let child: FakeChildProcess;
  let spawn: sinon.SinonStub;

  beforeEach(() => {
    const deps = createDeps();
    child = deps.child;
    spawn = deps.spawn as unknown as sinon.SinonStub;
  });

  it('spawns claude -p --output-format stream-json --include-partial-messages --verbose with the prompt last', () => {
    const callbacks = createCallbacks();

    runClaude({ spawn }, { prompt: 'hello world', cwd: '/a/b' }, callbacks);

    expect(spawn.callCount).toBe(1);
    const [command, args, options] = spawn.firstCall.args;
    expect(command).toBe('claude');
    expect(args).toEqual([
      '-p',
      '--output-format',
      'stream-json',
      '--include-partial-messages',
      '--verbose',
      'hello world'
    ]);
    expect(options).toEqual({ cwd: '/a/b' });
    expect((options as Record<string, unknown>).shell).toBeUndefined();
  });

  it('inserts --resume sessionId before the prompt when resumeSessionId is set', () => {
    const callbacks = createCallbacks();

    runClaude({ spawn }, { prompt: 'continue please', cwd: '/a/b', resumeSessionId: 'sess-9' }, callbacks);

    const [, args] = spawn.firstCall.args;
    expect(args).toEqual([
      '-p',
      '--output-format',
      'stream-json',
      '--include-partial-messages',
      '--verbose',
      '--resume',
      'sess-9',
      'continue please'
    ]);
  });

  it('dispatches the init event through onEvent', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit(
      'data',
      '{"type":"system","subtype":"init","session_id":"abc-123-def","model":"claude-sonnet-4","tools":["Bash"]}\n'
    );

    expect(callbacks.onEvent.callCount).toBe(1);
    expect(callbacks.onEvent.firstCall.args[0]).toEqual({
      type: 'system',
      subtype: 'init',
      session_id: 'abc-123-def',
      model: 'claude-sonnet-4',
      tools: ['Bash']
    });
  });

  it('handles events split across multiple stdout chunks in order', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    const full =
      '{"type":"system","subtype":"init","session_id":"s1","model":"m","tools":[]}\n' +
      '{"type":"stream_event","event":{"type":"content_block_delta","delta":{"type":"text_delta","text":"hi"}}}\n';
    child.stdout.emit('data', full.slice(0, 30));
    child.stdout.emit('data', full.slice(30));

    expect(callbacks.onEvent.callCount).toBe(2);
    expect(callbacks.onEvent.firstCall.args[0].type).toBe('system');
    expect(callbacks.onEvent.secondCall.args[0].type).toBe('stream_event');
  });

  it('passes result events through onEvent even when subtype is not success (no onError)', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit(
      'data',
      '{"type":"result","subtype":"error_max_turns","session_id":"s1"}\n'
    );

    expect(callbacks.onEvent.callCount).toBe(1);
    expect(callbacks.onEvent.firstCall.args[0]).toEqual({
      type: 'result',
      subtype: 'error_max_turns',
      session_id: 's1'
    });
    expect(callbacks.onError.callCount).toBe(0);
  });

  it('flushes the trailing unterminated line before dispatching close(0) -> onComplete', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit(
      'data',
      '{"type":"result","subtype":"success","result":"done","session_id":"s1"}'
    );
    child.emit('close', 0);

    expect(callbacks.onEvent.callCount).toBe(1);
    expect(callbacks.onComplete.callCount).toBe(1);
    expect(callbacks.onComplete.calledAfter(callbacks.onEvent)).toBe(true);
  });

  it('calls onError with a non-zero exit code on close', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.emit('close', 1);

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onError.firstCall.args[0]).toBe('claude exited with code 1');
    expect(callbacks.onComplete.callCount).toBe(0);
  });

  it('calls onError when the child process itself errors (e.g. ENOENT)', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.emit('error', new Error('spawn claude ENOENT'));

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onError.firstCall.args[0]).toBe('spawn claude ENOENT');
  });

  it('suppresses terminal callbacks after kill() is called', () => {
    const callbacks = createCallbacks();
    const handle = runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    handle.kill();
    child.emit('close', 0);
    child.emit('error', new Error('late error'));

    expect(callbacks.onComplete.callCount).toBe(0);
    expect(callbacks.onError.callCount).toBe(0);
    expect(child.kill.callCount).toBe(1);
  });

  it('does not call child.kill() before kill() is invoked', () => {
    const callbacks = createCallbacks();
    runClaude({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    expect(child.kill.callCount).toBe(0);
  });
});
