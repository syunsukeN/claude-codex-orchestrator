import * as assert from 'assert';
import * as vscode from 'vscode';

const EXTENSION_ID = 'local.claude-codex-orchestrator';

describe('Claude Codex Orchestrator extension', () => {
  it('activates successfully', async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension, `extension ${EXTENSION_ID} not found`);

    await extension?.activate();

    assert.strictEqual(extension?.isActive, true);
  });

  it('registers the openChat command', async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    await extension?.activate();

    const commands = await vscode.commands.getCommands(true);
    assert.ok(
      commands.includes('claudeCodexOrchestrator.openChat'),
      'claudeCodexOrchestrator.openChat command is not registered'
    );
  });

  it('executes the openChat command without throwing', async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    await extension?.activate();

    const project = { id: '/tmp/sample', name: 'sample', path: '/tmp/sample' };

    await assert.doesNotReject(async () => {
      await vscode.commands.executeCommand('claudeCodexOrchestrator.openChat', project);
    });
  });
});
