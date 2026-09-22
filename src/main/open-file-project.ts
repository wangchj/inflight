import fs from 'fs';

/**
 * Opens a file project.
 * @param projPath The file path of the project.
 * @returns The project object.
 * @throws This function throws an error if the project can't be opened.
 */
export function openFileProject(projPath: string) {
  const str = fs.readFileSync(projPath, 'utf-8');
  return JSON.parse(str);
}
