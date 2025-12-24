/**
 * This file is the version of `preload.ts` that exclude any Electron or native functionality for
 * the web build.
 */

import CProject from 'model/project';
import { Project } from 'types/project';
import { Workspace } from 'types/workspace';
import { sendRequestWeb } from 'renderer/utils/send-request-web';

/**
 * This is defined in webpack config files (DefinePlugin).
 */
declare const WEB_BUILD: boolean;

if (WEB_BUILD) {

/**
 * Gets the workspace object from local storage.
 *
 * @returns The workspace object or undefined if workspace does not exist.
 */
window.openWorkspace = async () => {
  try {
    const str = localStorage.getItem('workspace');
    return str ? JSON.parse(str) : undefined;
  }
  catch (error) {
    console.warn('Fail to open worksapce', error.message);
  }
}

/**
 * Flushes workspace model object to local storage.
 *
 * @param workspace The workspace object to save.
 */
window.saveWorkspace = async (workspace: Workspace) => {
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
window.openProject = async (path: string) => {
  try {
    const str = localStorage.getItem(`proj/${path}`);
    return str ? JSON.parse(str) : undefined;
  }
  catch (error) {
    console.warn('Fail to open project', error.message);
  }
}

/**
 * Saves the project to local storage.
 *
 * @param path The project path.
 * @param project The project object to save.
 */
window.saveProject = async (path: string, project: Project): Promise<void> => {
  localStorage.setItem(`proj/${path}`, JSON.stringify(project));
}

window.sendRequest = sendRequestWeb;

/**
 * Opens file selection dialog window to allow user to select a project file from disk.
 *
 * @returns A promise that resolves to the path of the project file in local storage; or undefined.
 */
window.showOpenProjectDialog = async (): Promise<string> => {

  console.log('showOpenProjectDialog');

  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    input.addEventListener('change', async () => {

      console.log('showOpenProjectDialog input.onchange');

      try {
        const file = input.files?.[0];
        const text = await file.text();

        console.log(`showOpenProjectDialog file: ${file}`);
        console.log(`showOpenProjectDialog text: ${text}`);

        if (!file || !text) {
          resolve(undefined);
        }

        localStorage.setItem(`proj/${file.name}`, text);
        resolve(file.name);
      }
      catch (error) {
        console.log(`showOpenProjectDialog error: ${error}`);
        resolve(undefined);
      }
      finally {
        console.log(`showOpenProjectDialog finally`);
        input?.remove();
      }
    });

    input.addEventListener('cancel', () => {
      console.log(`showOpenProjectDialog oncancel`);
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
window.showNewProjectDialog = async (name: string): Promise<string> => {
  const project = new CProject(name);
  localStorage.setItem(`proj/${name}`, JSON.stringify(project));
  return name;
}

window.onSave = async () => {
  return null;
}

window.onCloseProject = async () => {
  return null;
}

window.onOpenProject = async () => {
  return null;
}

window.onCloseTab = async () => {
  return null;
}
}