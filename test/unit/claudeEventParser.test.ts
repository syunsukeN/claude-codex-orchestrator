import { describe, it, expect } from 'vitest';
import { parseClaudeEventLine, ClaudeEventParser } from '../../src/extension/claudeEventParser';

const BASIC_PATTERN_LINES = [
  '{"type":"system","subtype":"init","session_id":"abc-123-def","model":"claude-sonnet-4","tools":["Bash","Read","Edit","Write"]}',
  '{"type":"stream_event","event":{"type":"message_start","message":{"id":"msg_01"}}}',
  '{"type":"stream_event","event":{"type":"content_block_start","index":0,"content_block":{"type":"text","text":""}}}',
  '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"レビュー"}}}',
  '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"します"}}}',
  '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"。"}}}',
  '{"type":"stream_event","event":{"type":"content_block_stop","index":0}}',
  '{"type":"assistant","message":{"id":"msg_01","role":"assistant","content":[{"type":"text","text":"レビューします。"}]}}',
  '{"type":"result","subtype":"success","result":"レビューします。","session_id":"abc-123-def","total_cost_usd":0.0042,"usage":{"input_tokens":1024,"output_tokens":12,"cache_creation_input_tokens":0,"cache_read_input_tokens":0},"duration_ms":1234}'
];

const TOOL_USE_PATTERN_LINES = [
  '{"type":"system","subtype":"init","session_id":"abc-456","model":"claude-sonnet-4","tools":["Bash","Read"]}',
  '{"type":"stream_event","event":{"type":"content_block_start","index":0,"content_block":{"type":"tool_use","id":"toolu_01","name":"Read","input":{}}}}',
  '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"input_json_delta","partial_json":"{\\"file_path\\":\\"README.md\\"}"}}}',
  '{"type":"stream_event","event":{"type":"content_block_stop","index":0}}',
  '{"type":"assistant","message":{"id":"msg_02","role":"assistant","content":[{"type":"tool_use","id":"toolu_01","name":"Read","input":{"file_path":"README.md"}}]}}',
  '{"type":"user","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"toolu_01","content":"# Sample Project\\n..."}]}}',
  '{"type":"stream_event","event":{"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"READMEを確認しました"}}}',
  '{"type":"assistant","message":{"id":"msg_03","role":"assistant","content":[{"type":"text","text":"READMEを確認しました。"}]}}',
  '{"type":"result","subtype":"success","result":"READMEを確認しました。","session_id":"abc-456","total_cost_usd":0.005,"usage":{"input_tokens":2048,"output_tokens":20},"duration_ms":2345}'
];

describe('parseClaudeEventLine', () => {
  it('parses system init with session_id/model/tools', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[0])).toEqual({
      type: 'system',
      subtype: 'init',
      session_id: 'abc-123-def',
      model: 'claude-sonnet-4',
      tools: ['Bash', 'Read', 'Edit', 'Write']
    });
  });

  it('returns null for stream_event message_start', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[1])).toBeNull();
  });

  it('returns null for stream_event content_block_start', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[2])).toBeNull();
  });

  it('parses stream_event content_block_delta text_delta', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[3])).toEqual({
      type: 'stream_event',
      event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'レビュー' } }
    });
  });

  it('returns null for stream_event content_block_stop', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[6])).toBeNull();
  });

  it('parses assistant message with text content', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[7])).toEqual({
      type: 'assistant',
      message: { content: [{ type: 'text', text: 'レビューします。' }] }
    });
  });

  it('parses result with all fields', () => {
    expect(parseClaudeEventLine(BASIC_PATTERN_LINES[8])).toEqual({
      type: 'result',
      subtype: 'success',
      result: 'レビューします。',
      session_id: 'abc-123-def',
      total_cost_usd: 0.0042,
      usage: {
        input_tokens: 1024,
        output_tokens: 12,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0
      },
      duration_ms: 1234
    });
  });

  it('returns null for stream_event input_json_delta (tool use pattern)', () => {
    expect(parseClaudeEventLine(TOOL_USE_PATTERN_LINES[2])).toBeNull();
  });

  it('returns null for stream_event content_block_start with tool_use block', () => {
    expect(parseClaudeEventLine(TOOL_USE_PATTERN_LINES[1])).toBeNull();
  });

  it('parses assistant message with tool_use content', () => {
    expect(parseClaudeEventLine(TOOL_USE_PATTERN_LINES[4])).toEqual({
      type: 'assistant',
      message: { content: [{ type: 'tool_use', id: 'toolu_01', name: 'Read', input: { file_path: 'README.md' } }] }
    });
  });

  it('returns null for user message (tool_result)', () => {
    expect(parseClaudeEventLine(TOOL_USE_PATTERN_LINES[5])).toBeNull();
  });

  it('parses result for the tool use pattern', () => {
    expect(parseClaudeEventLine(TOOL_USE_PATTERN_LINES[8])).toEqual({
      type: 'result',
      subtype: 'success',
      result: 'READMEを確認しました。',
      session_id: 'abc-456',
      total_cost_usd: 0.005,
      usage: { input_tokens: 2048, output_tokens: 20 },
      duration_ms: 2345
    });
  });

  it('returns null for system api_retry subtype', () => {
    const line = '{"type":"system","subtype":"api_retry","session_id":"abc-123"}';
    expect(parseClaudeEventLine(line)).toBeNull();
  });

  it('returns null for system plugin_install subtype', () => {
    const line = '{"type":"system","subtype":"plugin_install","session_id":"abc-123"}';
    expect(parseClaudeEventLine(line)).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(parseClaudeEventLine('{not json')).toBeNull();
  });

  it('returns null for an empty line', () => {
    expect(parseClaudeEventLine('')).toBeNull();
  });

  it('returns null for a whitespace-only line', () => {
    expect(parseClaudeEventLine('   ')).toBeNull();
  });

  it('returns null for an unknown top-level type', () => {
    expect(parseClaudeEventLine('{"type":"something.unknown"}')).toBeNull();
  });

  it('filters assistant content to only text/tool_use/thinking blocks', () => {
    const line =
      '{"type":"assistant","message":{"content":[{"type":"text","text":"a"},{"type":"thinking","thinking":"t"},{"type":"tool_use","id":"x","name":"n","input":{}}]}}';
    expect(parseClaudeEventLine(line)).toEqual({
      type: 'assistant',
      message: {
        content: [
          { type: 'text', text: 'a' },
          { type: 'thinking', thinking: 't' },
          { type: 'tool_use', id: 'x', name: 'n', input: {} }
        ]
      }
    });
  });
});

describe('ClaudeEventParser', () => {
  it('parses a full chunk containing multiple complete lines', () => {
    const parser = new ClaudeEventParser();
    const chunk = BASIC_PATTERN_LINES.join('\n') + '\n';

    const events = parser.push(chunk);

    expect(events).toHaveLength(6);
    expect(events[0]).toEqual({
      type: 'system',
      subtype: 'init',
      session_id: 'abc-123-def',
      model: 'claude-sonnet-4',
      tools: ['Bash', 'Read', 'Edit', 'Write']
    });
    expect(events[1].type).toBe('stream_event');
    expect(events[2].type).toBe('stream_event');
    expect(events[3].type).toBe('stream_event');
    expect(events[4].type).toBe('assistant');
    expect(events[5].type).toBe('result');
  });

  it('buffers a line split across two chunks and parses once complete', () => {
    const parser = new ClaudeEventParser();
    const line = BASIC_PATTERN_LINES[0];
    const half = Math.floor(line.length / 2);

    const firstEvents = parser.push(line.slice(0, half));
    expect(firstEvents).toEqual([]);

    const secondEvents = parser.push(line.slice(half) + '\n');
    expect(secondEvents).toEqual([
      {
        type: 'system',
        subtype: 'init',
        session_id: 'abc-123-def',
        model: 'claude-sonnet-4',
        tools: ['Bash', 'Read', 'Edit', 'Write']
      }
    ]);
  });

  it('flush() emits the trailing line with no terminating newline', () => {
    const parser = new ClaudeEventParser();
    parser.push(BASIC_PATTERN_LINES[8]);

    const flushed = parser.flush();

    expect(flushed).toEqual([
      {
        type: 'result',
        subtype: 'success',
        result: 'レビューします。',
        session_id: 'abc-123-def',
        total_cost_usd: 0.0042,
        usage: {
          input_tokens: 1024,
          output_tokens: 12,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0
        },
        duration_ms: 1234
      }
    ]);
  });

  it('flush() returns an empty array when the buffer is empty', () => {
    const parser = new ClaudeEventParser();
    parser.push('line one\n');

    const flushed = parser.flush();

    expect(flushed).toEqual([]);
  });
});
