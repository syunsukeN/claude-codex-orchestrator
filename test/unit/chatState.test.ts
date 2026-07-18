import { describe, it, expect } from 'vitest';
import { applyCodexEvent, applyClaudeEvent, type ChatMessage } from '../../src/webview/chatState';
import type { CodexEvent } from '../../src/shared/codexEvents';
import type { ClaudeEvent } from '../../src/shared/claudeEvents';

const FAKE_EVENTS: CodexEvent[] = [
  { type: 'thread.started', thread_id: '0199a213-81c0-7800-8aa1-bbab2a035a53' },
  { type: 'turn.started' },
  {
    type: 'item.started',
    item: {
      id: 'item_1',
      type: 'command_execution',
      command: 'bash -lc ls',
      aggregated_output: '',
      exit_code: null,
      status: 'in_progress'
    }
  },
  {
    type: 'item.completed',
    item: {
      id: 'item_1',
      type: 'command_execution',
      command: 'bash -lc ls',
      aggregated_output: 'docs\nsrc\n',
      exit_code: 0,
      status: 'completed'
    }
  },
  {
    type: 'item.completed',
    item: {
      id: 'item_4',
      type: 'file_change',
      changes: [
        { path: 'docs/exec-json-cheatsheet.md', kind: 'add' },
        { path: 'docs/exec.md', kind: 'update' }
      ],
      status: 'completed'
    }
  },
  {
    type: 'item.completed',
    item: { id: 'item_3', type: 'agent_message', text: 'Done. I updated the docs and added examples.' }
  },
  {
    type: 'turn.completed',
    usage: { input_tokens: 24763, cached_input_tokens: 24448, output_tokens: 122 }
  }
];

describe('applyCodexEvent', () => {
  it('ignores thread.started and turn.started (state unchanged)', () => {
    const messages: ChatMessage[] = [];
    const afterThreadStarted = applyCodexEvent(messages, FAKE_EVENTS[0]);
    const afterTurnStarted = applyCodexEvent(afterThreadStarted, FAKE_EVENTS[1]);

    expect(afterTurnStarted).toEqual([]);
  });

  it('upserts a command_execution item by itemId without growing the array on update', () => {
    let messages: ChatMessage[] = [];
    messages = applyCodexEvent(messages, FAKE_EVENTS[2]);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ kind: 'command', itemId: 'item_1', status: 'in_progress', exitCode: null });

    messages = applyCodexEvent(messages, FAKE_EVENTS[3]);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject({ kind: 'command', itemId: 'item_1', status: 'completed', exitCode: 0 });
  });

  it('appends a fileChange message on item.completed', () => {
    const messages = applyCodexEvent([], FAKE_EVENTS[4]);
    expect(messages).toEqual([
      {
        kind: 'fileChange',
        changes: [
          { path: 'docs/exec-json-cheatsheet.md', kind: 'add' },
          { path: 'docs/exec.md', kind: 'update' }
        ]
      }
    ]);
  });

  it('appends an agent message on item.completed agent_message', () => {
    const messages = applyCodexEvent([], FAKE_EVENTS[5]);
    expect(messages).toEqual([{ kind: 'agent', text: 'Done. I updated the docs and added examples.' }]);
  });

  it('appends a turnCompleted message on turn.completed', () => {
    const messages = applyCodexEvent([], FAKE_EVENTS[6]);
    expect(messages).toEqual([
      { kind: 'turnCompleted', usage: { input_tokens: 24763, cached_input_tokens: 24448, output_tokens: 122 } }
    ]);
  });

  it('ignores reasoning, mcp_tool_call, web_search and todo_list items', () => {
    const events: CodexEvent[] = [
      { type: 'item.completed', item: { id: 'i1', type: 'reasoning', text: 'thinking' } },
      {
        type: 'item.completed',
        item: {
          id: 'i2',
          type: 'mcp_tool_call',
          server: 's',
          tool: 't',
          arguments: {},
          result: {},
          error: null,
          status: 'completed'
        }
      },
      { type: 'item.completed', item: { id: 'i3', type: 'web_search', query: 'q' } },
      { type: 'item.started', item: { id: 'i4', type: 'todo_list', items: [{ text: 'a', completed: false }] } }
    ];

    const messages = events.reduce((acc, event) => applyCodexEvent(acc, event), [] as ChatMessage[]);

    expect(messages).toEqual([]);
  });

  it('appends an error message for a non-fatal item error', () => {
    const event: CodexEvent = {
      type: 'item.completed',
      item: { id: 'i5', type: 'error', message: 'warn' }
    };

    const messages = applyCodexEvent([], event);

    expect(messages).toEqual([{ kind: 'error', message: 'warn' }]);
  });

  it('processes the full fake JSONL event sequence into the expected message list', () => {
    const messages = FAKE_EVENTS.reduce((acc, event) => applyCodexEvent(acc, event), [] as ChatMessage[]);

    expect(messages).toEqual([
      {
        kind: 'command',
        itemId: 'item_1',
        command: 'bash -lc ls',
        status: 'completed',
        exitCode: 0,
        output: 'docs\nsrc\n'
      },
      {
        kind: 'fileChange',
        changes: [
          { path: 'docs/exec-json-cheatsheet.md', kind: 'add' },
          { path: 'docs/exec.md', kind: 'update' }
        ]
      },
      { kind: 'agent', text: 'Done. I updated the docs and added examples.' },
      { kind: 'turnCompleted', usage: { input_tokens: 24763, cached_input_tokens: 24448, output_tokens: 122 } }
    ]);
  });

  it('does not mutate the input array (returns a new array)', () => {
    const original: ChatMessage[] = [];
    const result = applyCodexEvent(original, FAKE_EVENTS[2]);

    expect(result).not.toBe(original);
    expect(original).toEqual([]);
  });
});

describe('applyClaudeEvent', () => {
  it('ignores the system init event (state unchanged)', () => {
    const event: ClaudeEvent = {
      type: 'system',
      subtype: 'init',
      session_id: 'abc-123-def',
      model: 'claude-sonnet-4',
      tools: ['Bash']
    };

    expect(applyClaudeEvent([], event)).toEqual([]);
  });

  it('accumulates three text_delta events into a single streaming agent message', () => {
    const deltas: ClaudeEvent[] = ['レビュー', 'します', '。'].map((text) => ({
      type: 'stream_event',
      event: { type: 'content_block_delta', delta: { type: 'text_delta', text } }
    }));

    const messages = deltas.reduce((acc, event) => applyClaudeEvent(acc, event), [] as ChatMessage[]);

    expect(messages).toEqual([{ kind: 'agent', text: 'レビューします。', streaming: true }]);
  });

  it('dedupes the result text after streaming (clears the streaming flag without pushing a duplicate)', () => {
    let messages: ChatMessage[] = [];
    messages = applyClaudeEvent(messages, {
      type: 'stream_event',
      event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'レビューします。' } }
    });
    messages = applyClaudeEvent(messages, {
      type: 'result',
      subtype: 'success',
      result: 'レビューします。',
      session_id: 'abc-123-def'
    });

    expect(messages).toEqual([{ kind: 'agent', text: 'レビューします。', streaming: false }]);
  });

  it('pushes the result text as a new agent message when nothing was streamed', () => {
    const messages = applyClaudeEvent([], {
      type: 'result',
      subtype: 'success',
      result: 'done',
      session_id: 's1'
    });

    expect(messages).toEqual([{ kind: 'agent', text: 'done' }]);
  });

  it('pushes a warning message when the result subtype is not success', () => {
    const messages = applyClaudeEvent([], {
      type: 'result',
      subtype: 'error_max_turns',
      session_id: 's1'
    });

    expect(messages.some((m) => m.kind === 'warning')).toBe(true);
  });

  it('pushes a toolUse message for a tool_use content block', () => {
    const event: ClaudeEvent = {
      type: 'assistant',
      message: { content: [{ type: 'tool_use', id: 'toolu_01', name: 'Read', input: { file_path: 'README.md' } }] }
    };

    const messages = applyClaudeEvent([], event);

    expect(messages).toEqual([
      { kind: 'toolUse', toolUseId: 'toolu_01', name: 'Read', inputSummary: '{"file_path":"README.md"}' }
    ]);
  });

  it('ignores text and thinking content blocks in assistant events', () => {
    const event: ClaudeEvent = {
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'ignored' },
          { type: 'thinking', thinking: 'ignored' }
        ]
      }
    };

    expect(applyClaudeEvent([], event)).toEqual([]);
  });

  it('truncates a long tool input summary to 100 characters', () => {
    const longValue = 'x'.repeat(200);
    const event: ClaudeEvent = {
      type: 'assistant',
      message: { content: [{ type: 'tool_use', id: 't1', name: 'Write', input: { value: longValue } }] }
    };

    const messages = applyClaudeEvent([], event);

    expect(messages).toHaveLength(1);
    const message = messages[0] as { kind: 'toolUse'; inputSummary: string };
    expect(message.inputSummary.length).toBe(100);
  });

  it('processes the tool-use fake JSONL pattern end to end', () => {
    const events: ClaudeEvent[] = [
      {
        type: 'system',
        subtype: 'init',
        session_id: 'abc-456',
        model: 'claude-sonnet-4',
        tools: ['Bash', 'Read']
      },
      {
        type: 'assistant',
        message: { content: [{ type: 'tool_use', id: 'toolu_01', name: 'Read', input: { file_path: 'README.md' } }] }
      },
      {
        type: 'stream_event',
        event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'READMEを確認しました' } }
      },
      {
        type: 'assistant',
        message: { content: [{ type: 'text', text: 'READMEを確認しました。' }] }
      },
      {
        type: 'result',
        subtype: 'success',
        result: 'READMEを確認しました。',
        session_id: 'abc-456'
      }
    ];

    const messages = events.reduce((acc, event) => applyClaudeEvent(acc, event), [] as ChatMessage[]);

    expect(messages).toEqual([
      { kind: 'toolUse', toolUseId: 'toolu_01', name: 'Read', inputSummary: '{"file_path":"README.md"}' },
      { kind: 'agent', text: 'READMEを確認しました', streaming: false }
    ]);
  });

  it('does not mutate the input array (returns a new array)', () => {
    const original: ChatMessage[] = [];
    const event: ClaudeEvent = {
      type: 'stream_event',
      event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'hi' } }
    };

    const result = applyClaudeEvent(original, event);

    expect(result).not.toBe(original);
    expect(original).toEqual([]);
  });
});
