export interface Project {
  id: string;
  name: string;
  path: string;
}

export interface WorkspaceFolderLike {
  name: string;
  uri: { fsPath: string };
}

export function getProjects(folders: readonly WorkspaceFolderLike[] | undefined): Project[] {
  if (!folders) {
    return [];
  }

  return folders.map((folder) => ({
    id: folder.uri.fsPath,
    name: folder.name,
    path: folder.uri.fsPath
  }));
}
