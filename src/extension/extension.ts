import * as vscode from 'vscode';
import { spawn } from 'node:child_process';
import { openChatPanel } from './chatPanel';
import type { Project } from './projects';
import { ProjectTreeProvider } from './projectTreeProvider';

export function activate(context: vscode.ExtensionContext): void {
  const projectTreeProvider = new ProjectTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('claudeCodexOrchestrator.projects', projectTreeProvider),
    vscode.workspace.onDidChangeWorkspaceFolders(() => projectTreeProvider.refresh()),
    vscode.commands.registerCommand('claudeCodexOrchestrator.openChat', (project: Project) => {
      openChatPanel(
        {
          createWebviewPanel: vscode.window.createWebviewPanel.bind(vscode.window),
          spawn
        },
        project,
        context.extensionUri
      );
    })
  );
}

export function deactivate(): void {
  /* no-op */
}
