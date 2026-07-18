import { describe, it, expect } from 'vitest';
import { parseCodexEventLine, CodexEventParser } from '../../src/extension/codexEventParser';

const FAKE_JSONL_LINES = [
  '{"type":"thread.started","thread_id":"0199a213-81c0-7800-8aa1-bbab2a035a53"}',
  '{"type":"turn.started"}',
  '{"type":"item.started","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","aggregated_output":"","exit_code":null,"status":"in_progress"}}',
  '{"type":"item.completed","item":{"id":"item_1","type":"command_execution","command":"bash -lc ls","aggregated_output":"docs\\nsrc\\n","exit_code":0,"status":"completed"}}',
  '{"type":"item.completed","item":{"id":"item_4","type":"file_change","changes":[{"path":"docs/exec-json-cheatsheet.md","kind":"add"},{"path":"docs/exec.md","kind":"update"}],"status":"completed"}}',
  '{"type":"item.completed","item":{"id":"item_3","type":"agent_message","text":"Done. I updated the docs and added examples."}}',
  '{"type":"turn.completed","usage":{"input_tokens":24763,"cached_input_tokens":24448,"output_tokens":122}}'
];

describe('parseCodexEventLine', () => {
  it('parses thread.started', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[0])).toEqual({
      type: 'thread.started',
      thread_id: '0199a213-81c0-7800-8aa1-bbab2a035a53'
    });
  });

  it('parses turn.started', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[1])).toEqual({ type: 'turn.started' });
  });

  it('parses item.started command_execution (in_progress)', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[2])).toEqual({
      type: 'item.started',
      item: {
        id: 'item_1',
        type: 'command_execution',
        command: 'bash -lc ls',
        aggregated_output: '',
        exit_code: null,
        status: 'in_progress'
      }
    });
  });

  it('parses item.completed command_execution', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[3])).toEqual({
      type: 'item.completed',
      item: {
        id: 'item_1',
        type: 'command_execution',
        command: 'bash -lc ls',
        aggregated_output: 'docs\nsrc\n',
        exit_code: 0,
        status: 'completed'
      }
    });
  });

  it('parses item.completed file_change', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[4])).toEqual({
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
    });
  });

  it('parses item.completed agent_message', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[5])).toEqual({
      type: 'item.completed',
      item: {
        id: 'item_3',
        type: 'agent_message',
        text: 'Done. I updated the docs and added examples.'
      }
    });
  });

  it('parses turn.completed', () => {
    expect(parseCodexEventLine(FAKE_JSONL_LINES[6])).toEqual({
      type: 'turn.completed',
      usage: { input_tokens: 24763, cached_input_tokens: 24448, output_tokens: 122 }
    });
  });

  it('parses turn.failed', () => {
    const line = '{"type":"turn.failed","error":{"message":"boom"}}';
    expect(parseCodexEventLine(line)).toEqual({ type: 'turn.failed', error: { message: 'boom' } });
  });

  it('parses top-level error', () => {
    const line = '{"type":"error","message":"Reconnecting... 1/5"}';
    expect(parseCodexEventLine(line)).toEqual({ type: 'error', message: 'Reconnecting... 1/5' });
  });

  it('parses item reasoning', () => {
    const line = '{"type":"item.completed","item":{"id":"item_9","type":"reasoning","text":"thinking..."}}';
    expect(parseCodexEventLine(line)).toEqual({
      type: 'item.completed',
      item: { id: 'item_9', type: 'reasoning', text: 'thinking...' }
    });
  });

  it('parses item mcp_tool_call', () => {
    const line =
      '{"type":"item.completed","item":{"id":"item_5","type":"mcp_tool_call","server":"s","tool":"t","arguments":{},"result":{},"error":null,"status":"completed"}}';
    expect(parseCodexEventLine(line)).toEqual({
      type: 'item.completed',
      item: {
        id: 'item_5',
        type: 'mcp_tool_call',
        server: 's',
        tool: 't',
        arguments: {},
        result: {},
        error: null,
        status: 'completed'
      }
    });
  });

  it('parses item web_search', () => {
    const line = '{"type":"item.completed","item":{"id":"item_6","type":"web_search","query":"vscode api"}}';
    expect(parseCodexEventLine(line)).toEqual({
      type: 'item.completed',
      item: { id: 'item_6', type: 'web_search', query: 'vscode api' }
    });
  });

  it('parses item todo_list', () => {
    const line =
      '{"type":"item.started","item":{"id":"item_7","type":"todo_list","items":[{"text":"a","completed":false}]}}';
    expect(parseCodexEventLine(line)).toEqual({
      type: 'item.started',
      item: { id: 'item_7', type: 'todo_list', items: [{ text: 'a', completed: false }] }
    });
  });

  it('parses item error (non-fatal warning)', () => {
    const line = '{"type":"item.completed","item":{"id":"item_8","type":"error","message":"warn"}}';
    expect(parseCodexEventLine(line)).toEqual({
      type: 'item.completed',
      item: { id: 'item_8', type: 'error', message: 'warn' }
    });
  });

  it('returns null for an empty line', () => {
    expect(parseCodexEventLine('')).toBeNull();
  });

  it('returns null for a whitespace-only line', () => {
    expect(parseCodexEventLine('   ')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseCodexEventLine('{not json')).toBeNull();
  });

  it('returns null for an unknown top-level type', () => {
    expect(parseCodexEventLine('{"type":"something.unknown"}')).toBeNull();
  });

  it('returns null for an unknown item type', () => {
    const line = '{"type":"item.completed","item":{"id":"item_10","type":"mystery"}}';
    expect(parseCodexEventLine(line)).toBeNull();
  });
});

describe('CodexEventParser', () => {
  it('parses a full chunk containing multiple complete lines', () => {
    const parser = new CodexEventParser();
    const chunk = FAKE_JSONL_LINES.slice(0, 3).join('\n') + '\n';

    const events = parser.push(chunk);

    expect(events).toHaveLength(3);
    expect(events[0]).toEqual({ type: 'thread.started', thread_id: '0199a213-81c0-7800-8aa1-bbab2a035a53' });
    expect(events[2].type).toBe('item.started');
  });

  it('buffers a line split across two chunks and parses once complete', () => {
    const parser = new CodexEventParser();
    const line = FAKE_JSONL_LINES[0];
    const half = Math.floor(line.length / 2);

    const firstEvents = parser.push(line.slice(0, half));
    expect(firstEvents).toEqual([]);

    const secondEvents = parser.push(line.slice(half) + '\n');
    expect(secondEvents).toEqual([{ type: 'thread.started', thread_id: '0199a213-81c0-7800-8aa1-bbab2a035a53' }]);
  });

  it('flush() emits the trailing line with no terminating newline', () => {
    const parser = new CodexEventParser();
    parser.push(FAKE_JSONL_LINES[1]);

    const flushed = parser.flush();

    expect(flushed).toEqual([{ type: 'turn.started' }]);
  });

  it('flush() returns an empty array when the buffer is empty', () => {
    const parser = new CodexEventParser();
    parser.push('line one\n');

    const flushed = parser.flush();

    expect(flushed).toEqual([]);
  });

  it('skips invalid lines mixed in with valid ones', () => {
    const parser = new CodexEventParser();
    const chunk = ['not json', FAKE_JSONL_LINES[1], '', FAKE_JSONL_LINES[6]].join('\n') + '\n';

    const events = parser.push(chunk);

    expect(events).toEqual([
      { type: 'turn.started' },
      {
        type: 'turn.completed',
        usage: { input_tokens: 24763, cached_input_tokens: 24448, output_tokens: 122 }
      }
    ]);
  });
});
