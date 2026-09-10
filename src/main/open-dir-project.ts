import fs from 'fs';
import path from 'path';
import { Folder } from 'types/folder';
import { Project } from 'types/project';
import { loadRequestsTree } from './load-requests-tree';

export function openDirProject(path: string) {
  const project = openProjectFile(path);
  const reqTree = loadRequestsTree(path);
  const dimTree = getDimensionsTree(path);
}

/**
 * Opens the `project.json` file given the project directory location.
 *
 * @param dirPath The project directory location.
 * @return The project model object
 * @throws This function throws error if file can't be opened or parsed.
 */
function openProjectFile(dirPath: string): Project {
    const str = fs.readFileSync(path.resolve(dirPath, 'project.json'), 'utf-8');
    const obj = JSON.parse(str);

    // TODO: validate project file.

    return obj;
}


function getDimensionsTree(path: string) {

}
