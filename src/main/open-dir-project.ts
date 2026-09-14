import fs from 'fs';
import path from 'path';
import { Project } from 'types/project';
import { loadRequestsTree } from './load-requests-tree';
import { loadDimensions } from './load-dimensions-tree';

/**
 * Opens a directory based project.
 *
 * @param path The directory path of th project.
 * @returns The project model object.
 */
export function openDirProject(path: string) {
  const project = openProjectFile(path);
  const reqDesc = loadRequestsTree(path);
  const dimDesc = loadDimensions(path);

  return {
    ...project,
    ...reqDesc,
    ...dimDesc,
  };
}

/**
 * Opens the `project.json` file given the project directory location.
 *
 * @param dirPath The project directory location.
 * @return The project model object
 * @throws This function throws error if file can't be opened or parsed.
 */
function openProjectFile(dirPath: string): Project {
  /**
   * The file content.
   */
  let str: string;

  /**
   * The project model object.
   */
  let proj: Project;

  try {
    str = fs.readFileSync(path.resolve(dirPath, 'project.json'), 'utf-8');
  } catch (error) {
    throw new Error(
      'The selected location is not a valid project. Unable to open `project.json`.',
      { cause: error }
    );
  }

  try {
    proj = JSON.parse(str);
  } catch (error) {
    throw new Error(
      'The selected location is not a valid project. Unable to parse `project.json`.',
      { cause: error }
    );
  }

  validateProject(proj);

  return proj;
}

/**
 * Validates project model object.
 *
 * @param proj The project to validate.
 * @throw This function throws error if the project is invalid.
 */
function validateProject(proj: Project) {
  if (typeof proj !== 'object') {
    throw new Error('Invalid project: `project.json` is not a valid object.');
  }

  validateSpec(proj);
}

/**
 * Validates the project spec field.
 *
 * @param proj The project to validate.
 * @throw This function throws error if the spec format is invalid.
 */
function validateSpec(proj: Project) {
  const spec = proj.spec;
  const pattern = /^inflight-idp-\d+.\d+$/;
  if (!spec || !pattern.test(spec)) {
    throw new Error(`Invalid project: the project spec must match the pattern ${pattern}`);
  }
}
