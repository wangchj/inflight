/**
 * This file is the version of `preload.ts` that exclude any Electron or native functionality for
 * the web build.
 */

import CProject from 'model/project';
import { Project } from 'types/project';
import { Workspace } from 'types/workspace';
import { sendRequestWeb } from 'renderer/utils/send-request-web';
import { History } from 'types/history';

if (WEB_BUILD) {

/**
 * Gets the workspace object from local storage.
 *
 * @returns The workspace object or undefined if workspace does not exist.
 */
window.bridge.openWorkspace = async () => {
  try {
    const str = localStorage.getItem('workspace');
    return str ? JSON.parse(str) : undefined;
  }
  catch (error) {
    console.warn('Fail to open workspace', error.message);
  }
}

/**
 * Flushes workspace model object to local storage.
 *
 * @param workspace The workspace object to save.
 */
window.bridge.saveWorkspace = async (workspace: Workspace) => {
  try {
    localStorage.setItem('workspace', JSON.stringify(workspace));
  }
  catch (error) {
    console.warn('Fail to save workspace:', error.message);
  }
}

/**
 * Opens a project from local storage.
 *
 * @param path The project path.
 * @returns The project object or undefined if project does not exist.
 */
window.bridge.openProject = async (path: string) => {
  try {
    const str = localStorage.getItem(`proj/${path}`);
    return str ? JSON.parse(str) : undefined;
  }
  catch (error) {
    console.warn('Fail to open project', error.message);
  }
}

/**
 * Notifies the main process to close the project. This is not implemented for web build.
 */
window.bridge.closeProject = async() => {}

/**
 * Saves the project to local storage.
 *
 * @param path The project path.
 * @param project The project object to save.
 */
window.bridge.saveProject = async (path: string, project: Project): Promise<void> => {
  localStorage.setItem(`proj/${path}`, JSON.stringify(project));
}

/**
 * Gets the history object from local storage.
 *
 * @returns The history object or undefined if history does not exist.
 */
window.bridge.openHistory = async (): Promise<History> => {
  try {
    const str = localStorage.getItem('history');
    return str ? JSON.parse(str) : undefined;
  }
  catch (error) {
    console.warn('Fail to open history', error.message);
  }
}

/**
 * Saves history model object to local storage.
 *
 * @param history The history object to save.
 */
window.bridge.saveHistory = async (history: History): Promise<void> => {
  try {
    localStorage.setItem('history', JSON.stringify(history));
  }
  catch (error) {
    console.warn('Fail to save history:', error.message);
  }
}

window.bridge.sendRequest = sendRequestWeb;

/**
 * Opens file selection dialog window to allow user to select a project file from disk.
 *
 * @returns A promise that resolves to the path of the project file in local storage; or undefined.
 */
window.bridge.showOpenProjectDialog = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    input.addEventListener('change', async () => {
      try {
        const file = input.files?.[0];
        const text = await file.text();

        if (!file || !text) {
          resolve(undefined);
        }

        localStorage.setItem(`proj/${file.name}`, text);
        resolve(file.name);
      }
      catch (error) {
        resolve(undefined);
      }
      finally {
        input?.remove();
      }
    });

    input.addEventListener('cancel', () => {
      resolve(undefined);
    });

    input.click();
  });
}

/**
 * Creates a new project and returns the local storage key.
 *
 * @param name The name of the project.
 * @returns The name of the project.
 */
window.bridge.showNewProjectDialog = async (name?: string): Promise<string> => {
  if (!name) {
    name = "New Project"
  }
  const project = new CProject(name);
  localStorage.setItem(`proj/${name}`, JSON.stringify(project));
  return name;
}

window.bridge.onSaveMenuItemSelect = async () => {
  return null;
}

window.bridge.onCloseProjectMenuItemSelect = async () => {
  return null;
}

window.bridge.onOpenProjectMenuItemSelect = async () => {
  return null;
}

window.bridge.onCloseTabMenuItemSelect = async () => {
  return null;
}
}