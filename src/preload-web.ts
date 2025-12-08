/**
 * This file is the version of `preload.ts` that exclude any Electron or native functionality for
 * the web build.
 */

import makeRequestOptions from 'main/make-request-options';
import { Project } from 'types/project';
import { Request } from 'types/request';
import { RequestResult } from 'types/request-result';
import { Workspace } from 'types/workspace';

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

/**
 * Sends the HTTP request.
 *
 * @returns A promise that resolves to a RequestResult object.
 * @throws An error object if request fails.
 */
window.sendRequest = async (request: Request): Promise<RequestResult> => {
  console.log(`sendRequest() ${JSON.stringify(request)}`);

  const headers = Array.isArray(request.headers) ? Object.fromEntries(
    request.headers
      .filter(headers => headers.enabled && !!headers.key)
      .map(header => [header.key, header.value])
  ) : {};

  const options: RequestInit = {
    method: request.method,
    headers
  };

  if (request.body) {
    options.body = request.body
  }

  try {
    let resp = await fetch(request.url, options);
    let res =  {
      requestOptions: {
        ...makeRequestOptions(request),
        headers: request?.headers?.reduce((a, c) => {
          if (c.enabled) {
            a[c.key] = c.value;
          }
          return a;
        }, {} as Record<string, string>) ?? {}
      },
      response: {
        statusCode: resp.status,
        statusMessage: resp.statusText,
        headers: Object.fromEntries([...resp.headers.entries()]),
        rawHeaders: [...resp.headers.entries()].reduce((a, e) => {
          a.push(e[0]);
          a.push(e[1])
          return a;
        }, []),
        data: await resp.text(),
      }
    }

    return res;
  }
  catch (error) {
    console.log(error);
    error.message = 'Make sure you are online and the URL supports CORS.';
    throw error;
  }
}

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