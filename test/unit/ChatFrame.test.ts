import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/webview/vscodeApi', () => ({
  vscodeApi: {
    postMessage: vi.fn(),
    getState: vi.fn(),
    setState: vi.fn()
  }
}));

import { tick } from 'svelte';
import { render, fireEvent } from '@testing-library/svelte';
import ChatFrame from '../../src/webview/ChatFrame.svelte';
import { vscodeApi } from '../../src/webview/vscodeApi';

function dispatchHostMessage(data: unknown) {
  window.dispatchEvent(new MessageEvent('message', { data }));
}

describe('ChatFrame', () => {
  beforeEach(() => {
    vi.mocked(vscodeApi.postMessage).mockClear();
  });

  it('renders without throwing', () => {
    expect(() => render(ChatFrame)).not.toThrow();
  });

  it('shows the codex and claude ai toggle buttons', () => {
    const { getByTestId } = render(ChatFrame);

    expect(getByTestId('ai-toggle-codex')).toBeTruthy();
    expect(getByTestId('ai-toggle-claude')).toBeTruthy();
  });

  it('shows the message list region', () => {
    const { getByTestId } = render(ChatFrame);

    expect(getByTestId('message-list')).toBeTruthy();
  });

  it('shows the chat input', () => {
    const { getByTestId } = render(ChatFrame);

    expect(getByTestId('chat-input')).toBeTruthy();
  });

  it('shows the send button', () => {
    const { getByTestId } = render(ChatFrame);

    expect(getByTestId('send-button')).toBeTruthy();
  });

  it('posts a sendMessage to the host with the selected ai and text', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;

    await fireEvent.input(input, { target: { value: 'hello codex' } });
    await fireEvent.click(getByTestId('send-button'));

    expect(vscodeApi.postMessage).toHaveBeenCalledWith({ type: 'sendMessage', ai: 'codex', text: 'hello codex' });
  });

  it('locally echoes the sent message and clears the input', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;

    await fireEvent.input(input, { target: { value: 'hello there' } });
    await fireEvent.click(getByTestId('send-button'));

    expect(getByTestId('message-user').textContent).toContain('hello there');
    expect(input.value).toBe('');
  });

  it('disables the input and send button while a run is in progress', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;
    const sendButton = getByTestId('send-button') as HTMLButtonElement;

    await fireEvent.input(input, { target: { value: 'go' } });
    await fireEvent.click(sendButton);

    expect(input.disabled).toBe(true);
    expect(sendButton.disabled).toBe(true);
  });

  it('renders a codexEvent dispatched from the host as an agent message', async () => {
    const { getByTestId } = render(ChatFrame);

    dispatchHostMessage({
      type: 'codexEvent',
      event: { type: 'item.completed', item: { id: 'i1', type: 'agent_message', text: 'agent reply' } }
    });
    await tick();

    expect(getByTestId('message-agent').textContent).toContain('agent reply');
  });

  it('re-enables input after runCompleted is received', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;

    await fireEvent.input(input, { target: { value: 'go' } });
    await fireEvent.click(getByTestId('send-button'));
    expect(input.disabled).toBe(true);

    dispatchHostMessage({ type: 'runCompleted' });
    await tick();

    expect(input.disabled).toBe(false);
  });

  it('re-enables input and shows an error message after runFailed is received', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;

    await fireEvent.input(input, { target: { value: 'go' } });
    await fireEvent.click(getByTestId('send-button'));

    dispatchHostMessage({ type: 'runFailed', message: 'boom' });
    await tick();

    expect(input.disabled).toBe(false);
    expect(getByTestId('message-error').textContent).toContain('boom');
  });

  it('posts a sendMessage with ai: claude when the claude toggle is selected before sending', async () => {
    const { getByTestId } = render(ChatFrame);
    const input = getByTestId('chat-input') as HTMLTextAreaElement;

    await fireEvent.click(getByTestId('ai-toggle-claude'));
    await fireEvent.input(input, { target: { value: 'review this' } });
    await fireEvent.click(getByTestId('send-button'));

    expect(vscodeApi.postMessage).toHaveBeenCalledWith({ type: 'sendMessage', ai: 'claude', text: 'review this' });
  });

  it('accumulates consecutive claudeEvent text_delta dispatches into a streaming agent message', async () => {
    const { getByTestId } = render(ChatFrame);

    dispatchHostMessage({
      type: 'claudeEvent',
      event: { type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'レビュー' } } }
    });
    await tick();
    dispatchHostMessage({
      type: 'claudeEvent',
      event: { type: 'stream_event', event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'します。' } } }
    });
    await tick();

    expect(getByTestId('message-agent').textContent).toContain('レビューします。');
  });

  it('shows a warning message when a claudeEvent result has a non-success subtype', async () => {
    const { getByTestId } = render(ChatFrame);

    dispatchHostMessage({
      type: 'claudeEvent',
      event: { type: 'result', subtype: 'error_max_turns', session_id: 's1' }
    });
    await tick();

    expect(getByTestId('message-warning')).toBeTruthy();
  });
});
