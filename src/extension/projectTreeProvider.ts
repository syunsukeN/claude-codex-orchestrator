import * as vscode from 'vscode';
import { getProjects, type Project } from './projects';

export class ProjectTreeItem extends vscode.TreeItem {
  constructor(public readonly project: Project) {
    super(project.name, vscode.TreeItemCollapsibleState.None);
    this.description = project.path;
    this.tooltip = project.path;
    this.contextValue = 'claudeCodexOrchestrator.project';
    this.command = {
      command: 'claudeCodexOrchestrator.openChat',
      title: 'Open Chat',
      arguments: [project]
    };
  }
}

export class ProjectTreeProvider implements vscode.TreeDataProvider<ProjectTreeItem> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<
    ProjectTreeItem | undefined | void
  >();

  readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  getTreeItem(element: ProjectTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): ProjectTreeItem[] {
    const projects = getProjects(vscode.workspace.workspaceFolders);
    return projects.map((project) => new ProjectTreeItem(project));
  }
}
