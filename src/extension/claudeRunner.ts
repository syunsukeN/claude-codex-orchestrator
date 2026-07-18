import { ClaudeEventParser } from './claudeEventParser';
import type { ClaudeEvent } from '../shared/claudeEvents';
import type { ChildProcessLike, SpawnLike } from './codexRunner';

export interface RunClaudeDeps {
  spawn: SpawnLike;
}

export interface RunClaudeOptions {
  prompt: string;
  cwd: string;
  resumeSessionId?: string;
}

export interface RunClaudeCallbacks {
  onEvent(event: ClaudeEvent): void;
  onComplete(): void;
  onError(message: string): void;
}

export interface ClaudeRunHandle {
  kill(): void;
}

export function runClaude(
  deps: RunClaudeDeps,
  options: RunClaudeOptions,
  callbacks: RunClaudeCallbacks
): ClaudeRunHandle {
  const parser = new ClaudeEventParser();
  let settled = false;

  const baseArgs = ['-p', '--output-format', 'stream-json', '--include-partial-messages', '--verbose'];
  const args = options.resumeSessionId
    ? [...baseArgs, '--resume', options.resumeSessionId, options.prompt]
    : [...baseArgs, options.prompt];
  const child: ChildProcessLike = deps.spawn('claude', args, { cwd: options.cwd });

  function dispatch(event: ClaudeEvent): void {
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
        callbacks.onError(`claude exited with code ${code}`);
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
