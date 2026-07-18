import { CodexEventParser } from './codexEventParser';
import { isNonFatalReconnectError, type CodexEvent } from '../shared/codexEvents';

export interface ReadableStreamLike {
  on(event: 'data', listener: (chunk: Buffer | string) => void): unknown;
}

export interface ChildProcessLike {
  stdout: ReadableStreamLike | null;
  stderr: ReadableStreamLike | null;
  on(event: 'close', listener: (code: number | null) => void): unknown;
  on(event: 'error', listener: (err: Error) => void): unknown;
  kill(): void;
}

export type SpawnLike = (
  command: string,
  args: string[],
  options: { cwd: string }
) => ChildProcessLike;

export interface RunCodexDeps {
  spawn: SpawnLike;
}

export interface RunCodexOptions {
  prompt: string;
  cwd: string;
  resumeSessionId?: string;
}

export interface RunCodexCallbacks {
  onEvent(event: CodexEvent): void;
  onComplete(): void;
  onError(message: string): void;
}

export interface CodexRunHandle {
  kill(): void;
}

export function runCodex(
  deps: RunCodexDeps,
  options: RunCodexOptions,
  callbacks: RunCodexCallbacks
): CodexRunHandle {
  const parser = new CodexEventParser();
  let settled = false;

  const args = options.resumeSessionId
    ? ['exec', 'resume', '--json', options.resumeSessionId, options.prompt]
    : ['exec', '--json', options.prompt];
  const child = deps.spawn('codex', args, { cwd: options.cwd });

  function dispatch(event: CodexEvent): void {
    if (event.type === 'error') {
      if (isNonFatalReconnectError(event.message)) {
        return;
      }
      settle(() => callbacks.onError(event.message));
      return;
    }

    if (event.type === 'turn.failed') {
      settle(() => callbacks.onError(event.error.message));
      return;
    }

    callbacks.onEvent(event);
  }

  function settle(fn: () => void): void {
    if (settled) {
      return;
    }
    settled = true;
    fn();
  }

  child.stdout?.on('data', (chunk) => {
    const events = parser.push(chunk.toString());
    for (const event of events) {
      dispatch(event);
    }
  });

  child.on('close', (code) => {
    const events = parser.flush();
    for (const event of events) {
      dispatch(event);
    }
    settle(() => {
      if (code === 0) {
        callbacks.onComplete();
      } else {
        callbacks.onError(`codex exited with code ${code}`);
      }
    });
  });

  child.on('error', (err) => {
    settle(() => callbacks.onError(err.message));
  });

  return {
    kill(): void {
      settled = true;
      child.kill();
    }
  };
}
