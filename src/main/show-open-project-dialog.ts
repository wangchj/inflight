import { dialog } from 'electron';
import { getWindow } from './window-manager';

/**
 * Shows open project dialog.
 *
 * @returns The path of the project file that's selected.
 */
export async function showOpenProjectDialog(): Promise<string | undefined> {
  const window = getWindow();

  if (!window) {
    return;
  }

  const res = await dialog.showOpenDialog(window, {
    properties: ['openFile'],
    filters: [
      {
        name: 'Custom File Type',
        extensions: ['json'],
      }
    ],
  });

  return !res?.canceled && res.filePaths[0] ? res.filePaths[0] : undefined
}
