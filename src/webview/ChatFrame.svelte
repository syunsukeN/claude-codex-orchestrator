<script lang="ts">
  import { vscodeApi } from './vscodeApi';
  import MessageList from './MessageList.svelte';
  import { applyCodexEvent, applyClaudeEvent, type ChatMessage } from './chatState';
  import type { HostToWebviewMessage } from '../shared/messages';

  type Ai = 'codex' | 'claude';

  let currentAi = $state<Ai>('codex');
  let inputText = $state('');
  let messages = $state<ChatMessage[]>([]);
  let running = $state(false);

  function selectAi(ai: Ai) {
    currentAi = ai;
  }

  function sendMessage() {
    const text = inputText.trim();
    if (text.length === 0 || running) {
      return;
    }

    messages = [...messages, { kind: 'user', text }];
    running = true;
    vscodeApi.postMessage({ type: 'sendMessage', ai: currentAi, text });
    inputText = '';
  }

  function handleHostMessage(event: MessageEvent) {
    const data = event.data as HostToWebviewMessage;

    if (data.type === 'codexEvent') {
      messages = applyCodexEvent(messages, data.event);
    } else if (data.type === 'claudeEvent') {
      messages = applyClaudeEvent(messages, data.event);
    } else if (data.type === 'runCompleted') {
      running = false;
    } else if (data.type === 'runFailed') {
      running = false;
      messages = [...messages, { kind: 'error', message: data.message }];
    }
  }

  $effect(() => {
    window.addEventListener('message', handleHostMessage);
    return () => window.removeEventListener('message', handleHostMessage);
  });
</script>

<div class="chat-frame">
  <div class="ai-toggle" role="group" aria-label="AI選択">
    <button
      type="button"
      data-testid="ai-toggle-codex"
      aria-pressed={currentAi === 'codex'}
      class:selected={currentAi === 'codex'}
      onclick={() => selectAi('codex')}
    >
      Codex
    </button>
    <button
      type="button"
      data-testid="ai-toggle-claude"
      aria-pressed={currentAi === 'claude'}
      class:selected={currentAi === 'claude'}
      onclick={() => selectAi('claude')}
    >
      Claude
    </button>
  </div>

  <MessageList {messages} {running} />

  <div class="input-area">
    <textarea
      data-testid="chat-input"
      aria-label="メッセージ入力"
      bind:value={inputText}
      disabled={running}
    ></textarea>
    <button type="button" data-testid="send-button" onclick={sendMessage} disabled={running}>送信</button>
  </div>
</div>

<style>
  .chat-frame {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 8px;
  }

  .ai-toggle {
    display: flex;
    gap: 4px;
  }

  .ai-toggle button.selected {
    font-weight: bold;
    outline: 2px solid var(--vscode-focusBorder, #007acc);
  }

  .input-area {
    display: flex;
    gap: 4px;
  }

  .input-area textarea {
    flex: 1;
    resize: vertical;
    min-height: 3em;
  }
</style>
