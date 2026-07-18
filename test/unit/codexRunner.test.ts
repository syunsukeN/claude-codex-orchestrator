import { describe, it, expect, beforeEach } from 'vitest';
import sinon from 'sinon';
import { runCodex, type SpawnLike } from '../../src/extension/codexRunner';
import type { CodexEvent } from '../../src/shared/codexEvents';
import { FakeChildProcess } from './helpers/fakeChildProcess';

function createDeps() {
  const child = new FakeChildProcess();
  const spawn: SpawnLike = sinon.stub().returns(child) as unknown as SpawnLike;
  return { child, spawn };
}

function createCallbacks() {
  return {
    onEvent: sinon.stub<[CodexEvent], void>(),
    onComplete: sinon.stub(),
    onError: sinon.stub<[string], void>()
  };
}

describe('runCodex', () => {
  let child: FakeChildProcess;
  let spawn: sinon.SinonStub;

  beforeEach(() => {
    const deps = createDeps();
    child = deps.child;
    spawn = deps.spawn as unknown as sinon.SinonStub;
  });

  it('spawns codex exec --json with the prompt and cwd, without a shell', () => {
    const callbacks = createCallbacks();

    runCodex({ spawn }, { prompt: 'hello world', cwd: '/a/b' }, callbacks);

    expect(spawn.callCount).toBe(1);
    const [command, args, options] = spawn.firstCall.args;
    expect(command).toBe('codex');
    expect(args).toEqual(['exec', '--json', 'hello world']);
    expect(options).toEqual({ cwd: '/a/b' });
    expect((options as Record<string, unknown>).shell).toBeUndefined();
  });

  it('spawns codex exec resume --json with the session id and prompt when resumeSessionId is set', () => {
    const callbacks = createCallbacks();

    runCodex({ spawn }, { prompt: 'continue', cwd: '/a/b', resumeSessionId: 'sess-1' }, callbacks);

    expect(spawn.callCount).toBe(1);
    const [command, args, options] = spawn.firstCall.args;
    expect(command).toBe('codex');
    expect(args).toEqual(['exec', 'resume', '--json', 'sess-1', 'continue']);
    expect(options).toEqual({ cwd: '/a/b' });
  });

  it('dispatches parsed events from stdout data, thread.started passes through onEvent', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit('data', '{"type":"thread.started","thread_id":"abc-123"}\n');

    expect(callbacks.onEvent.callCount).toBe(1);
    expect(callbacks.onEvent.firstCall.args[0]).toEqual({ type: 'thread.started', thread_id: 'abc-123' });
  });

  it('handles events split across multiple stdout chunks in order', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    const full = '{"type":"thread.started","thread_id":"t1"}\n{"type":"turn.started"}\n';
    child.stdout.emit('data', full.slice(0, 20));
    child.stdout.emit('data', full.slice(20));

    expect(callbacks.onEvent.callCount).toBe(2);
    expect(callbacks.onEvent.firstCall.args[0]).toEqual({ type: 'thread.started', thread_id: 't1' });
    expect(callbacks.onEvent.secondCall.args[0]).toEqual({ type: 'turn.started' });
  });

  it('calls onError with the turn.failed message and does not call onComplete even if close(0) follows', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit('data', '{"type":"turn.failed","error":{"message":"model unavailable"}}\n');
    child.emit('close', 0);

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onError.firstCall.args[0]).toBe('model unavailable');
    expect(callbacks.onComplete.callCount).toBe(0);
  });

  it('ignores non-fatal "Reconnecting... X/Y" error events', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit('data', '{"type":"error","message":"Reconnecting... 1/5"}\n');

    expect(callbacks.onEvent.callCount).toBe(0);
    expect(callbacks.onError.callCount).toBe(0);
  });

  it('calls onError for a fatal top-level error event', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit('data', '{"type":"error","message":"fatal failure"}\n');

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onError.firstCall.args[0]).toBe('fatal failure');
  });

  it('flushes the trailing unterminated line before dispatching close(0) -> onComplete', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.stdout.emit('data', '{"type":"turn.started"}');
    child.emit('close', 0);

    expect(callbacks.onEvent.callCount).toBe(1);
    expect(callbacks.onEvent.firstCall.args[0]).toEqual({ type: 'turn.started' });
    expect(callbacks.onComplete.callCount).toBe(1);
    expect(callbacks.onComplete.calledAfter(callbacks.onEvent)).toBe(true);
  });

  it('calls onError with a non-zero exit code on close', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.emit('close', 1);

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onComplete.callCount).toBe(0);
  });

  it('calls onError when the child process itself errors (e.g. ENOENT)', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    child.emit('error', new Error('spawn codex ENOENT'));

    expect(callbacks.onError.callCount).toBe(1);
    expect(callbacks.onError.firstCall.args[0]).toBe('spawn codex ENOENT');
  });

  it('suppresses terminal callbacks after kill() is called', () => {
    const callbacks = createCallbacks();
    const handle = runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    handle.kill();
    child.emit('close', 0);
    child.emit('error', new Error('late error'));

    expect(callbacks.onComplete.callCount).toBe(0);
    expect(callbacks.onError.callCount).toBe(0);
    expect(child.kill.callCount).toBe(1);
  });

  it('does not call child.kill() before kill() is invoked', () => {
    const callbacks = createCallbacks();
    runCodex({ spawn }, { prompt: 'p', cwd: '/a' }, callbacks);

    expect(child.kill.callCount).toBe(0);
  });
});
