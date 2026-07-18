import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import MessageList from '../../src/webview/MessageList.svelte';
import type { ChatMessage } from '../../src/webview/chatState';

describe('MessageList', () => {
  it('renders nothing message-related for an empty message list', () => {
    const { queryByTestId } = render(MessageList, { props: { messages: [], running: false } });

    expect(queryByTestId('message-user')).toBeNull();
    expect(queryByTestId('message-agent')).toBeNull();
    expect(queryByTestId('message-command')).toBeNull();
    expect(queryByTestId('message-file-change')).toBeNull();
    expect(queryByTestId('message-error')).toBeNull();
    expect(queryByTestId('message-completed')).toBeNull();
  });

  it('renders a user message', () => {
    const messages: ChatMessage[] = [{ kind: 'user', text: 'hello' }];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-user').textContent).toContain('hello');
  });

  it('renders an agent message', () => {
    const messages: ChatMessage[] = [{ kind: 'agent', text: 'hi there' }];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-agent').textContent).toContain('hi there');
  });

  it('renders a command message with its status', () => {
    const messages: ChatMessage[] = [
      { kind: 'command', itemId: 'item_1', command: 'ls', status: 'completed', exitCode: 0, output: 'docs\n' }
    ];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-command').textContent).toContain('ls');
    expect(getByTestId('command-status').textContent).toContain('completed');
  });

  it('renders a file change message with paths', () => {
    const messages: ChatMessage[] = [
      {
        kind: 'fileChange',
        changes: [
          { path: 'a.ts', kind: 'add' },
          { path: 'b.ts', kind: 'update' }
        ]
      }
    ];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    const el = getByTestId('message-file-change');
    expect(el.textContent).toContain('a.ts');
    expect(el.textContent).toContain('b.ts');
  });

  it('renders an error message', () => {
    const messages: ChatMessage[] = [{ kind: 'error', message: 'boom' }];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-error').textContent).toContain('boom');
  });

  it('renders a turnCompleted message', () => {
    const messages: ChatMessage[] = [
      { kind: 'turnCompleted', usage: { input_tokens: 1, cached_input_tokens: 0, output_tokens: 2 } }
    ];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-completed')).toBeTruthy();
  });

  it('renders a toolUse message with its name and input summary', () => {
    const messages: ChatMessage[] = [
      { kind: 'toolUse', toolUseId: 'toolu_01', name: 'Read', inputSummary: '{"file_path":"README.md"}' }
    ];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-tool-use')).toBeTruthy();
    expect(getByTestId('tool-use-name').textContent).toContain('Read');
    expect(getByTestId('tool-use-input').textContent).toContain('README.md');
  });

  it('renders a warning message', () => {
    const messages: ChatMessage[] = [{ kind: 'warning', message: 'error_max_turns' }];
    const { getByTestId } = render(MessageList, { props: { messages, running: false } });

    expect(getByTestId('message-warning').textContent).toContain('error_max_turns');
  });

  it('shows a loading indicator when running is true', () => {
    const { getByTestId } = render(MessageList, { props: { messages: [], running: true } });

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('hides the loading indicator when running is false', () => {
    const { queryByTestId } = render(MessageList, { props: { messages: [], running: false } });

    expect(queryByTestId('loading-indicator')).toBeNull();
  });
});
