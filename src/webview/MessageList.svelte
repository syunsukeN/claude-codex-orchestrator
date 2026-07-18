<script lang="ts">
  import type { ChatMessage } from './chatState';

  interface Props {
    messages: ChatMessage[];
    running: boolean;
  }

  let { messages, running }: Props = $props();
</script>

<div class="message-list" data-testid="message-list" role="log" aria-label="メッセージ履歴">
  {#each messages as message}
    {#if message.kind === 'user'}
      <div class="message message-user" data-testid="message-user">{message.text}</div>
    {:else if message.kind === 'agent'}
      <div class="message message-agent" data-testid="message-agent">{message.text}</div>
    {:else if message.kind === 'command'}
      <div class="message message-command" data-testid="message-command">
        <code>{message.command}</code>
        <span data-testid="command-status">{message.status}</span>
        {#if message.output}
          <pre>{message.output}</pre>
        {/if}
      </div>
    {:else if message.kind === 'fileChange'}
      <div class="message message-file-change" data-testid="message-file-change">
        {#each message.changes as change}
          <div>{change.kind}: {change.path}</div>
        {/each}
      </div>
    {:else if message.kind === 'error'}
      <div class="message message-error" data-testid="message-error">{message.message}</div>
    {:else if message.kind === 'turnCompleted'}
      <div class="message message-completed" data-testid="message-completed">完了</div>
    {:else if message.kind === 'toolUse'}
      <div class="message message-tool-use" data-testid="message-tool-use">
        <span data-testid="tool-use-name">{message.name}</span>
        <code data-testid="tool-use-input">{message.inputSummary}</code>
      </div>
    {:else if message.kind === 'warning'}
      <div class="message message-warning" data-testid="message-warning">{message.message}</div>
    {/if}
  {/each}

  {#if running}
    <div class="loading-indicator" data-testid="loading-indicator">…</div>
  {/if}
</div>

<style>
  .message-list {
    flex: 1;
    overflow-y: auto;
    border: 1px solid var(--vscode-panel-border, #444);
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .message-error {
    color: var(--vscode-errorForeground, #f14c4c);
  }

  .message-command pre {
    white-space: pre-wrap;
    margin: 4px 0 0;
  }
</style>
