import fs from 'fs';

/**
 * Reads the content of a file on disk.
 *
 * @param path The path of the file.
 * @returns The file content.
 */
export async function readFile(path: string): Promise<string> {
  return fs.readFileSync(path, 'utf-8');
}
