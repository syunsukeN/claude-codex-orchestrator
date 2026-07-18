export interface ClaudeUsage {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
}

export type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'tool_use'; id: string; name: string; input: unknown }
  | { type: 'thinking'; thinking: string };

export type ClaudeEvent =
  | { type: 'system'; subtype: 'init'; session_id: string; model: string; tools: string[] }
  | { type: 'assistant'; message: { content: ClaudeContentBlock[] } }
  | {
      type: 'stream_event';
      event: { type: 'content_block_delta'; delta: { type: 'text_delta'; text: string } };
    }
  | {
      type: 'result';
      subtype: string;
      result?: string;
      session_id: string;
      total_cost_usd?: number;
      usage?: ClaudeUsage;
      duration_ms?: number;
    };
