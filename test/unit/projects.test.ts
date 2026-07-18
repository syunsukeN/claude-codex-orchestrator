import { describe, it, expect } from 'vitest';
import { getProjects } from '../../src/extension/projects';

describe('getProjects', () => {
  it('returns one project when one workspace folder is given', () => {
    const folders = [{ name: 'my-project', uri: { fsPath: '/Users/foo/my-project' } }];

    const result = getProjects(folders);

    expect(result).toEqual([
      { id: '/Users/foo/my-project', name: 'my-project', path: '/Users/foo/my-project' }
    ]);
  });

  it('returns all projects when multiple workspace folders are given', () => {
    const folders = [
      { name: 'project-a', uri: { fsPath: '/Users/foo/project-a' } },
      { name: 'project-b', uri: { fsPath: '/Users/foo/project-b' } }
    ];

    const result = getProjects(folders);

    expect(result).toEqual([
      { id: '/Users/foo/project-a', name: 'project-a', path: '/Users/foo/project-a' },
      { id: '/Users/foo/project-b', name: 'project-b', path: '/Users/foo/project-b' }
    ]);
  });

  it('returns an empty array when given undefined', () => {
    expect(getProjects(undefined)).toEqual([]);
  });

  it('returns an empty array when given an empty array', () => {
    expect(getProjects([])).toEqual([]);
  });
});
