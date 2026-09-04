import { app, dialog } from 'electron';
import fs from 'fs';
import CProject from "model/project";
import { Project } from 'types/project';
import { History } from 'types/history';
import { Request } from 'types/request';
import { RequestResult } from 'types/request-result';
import { Workspace } from 'types/workspace';
import * as client from './client';
import makeRequestOptions from './make-request-options';
import { updateMenu } from './menu-manager';
import signRequestSigv4 from './sign-request-sigv4';
import { getWindow } from './window-manager';
export { showOpenProjectDialog } from './show-open-project-dialog';

/**
 * Path to the Application Support folder.
 */
const dataDirPath = app.getPath('userData');

/**
 * Workspace file path
 */
const workspaceFilePath = `${dataDirPath}/workspace.json`;

/**
 * History file path.
 */
const historyFilePath = `${dataDirPath}/history.json`;


/**
 * Opens workspace file from disk.
 *
 * @returns The workspace object or undefined if workspace does not exist.
 */
export async function openWorkspace(): Promise<Workspace | undefined> {
  try {
    const str = fs.readFileSync(workspaceFilePath, 'utf-8');
    return JSON.parse(str);
  }
  catch (error) {
    return;
  }
}

/**
 * Saves workspace to disk.
 *
 * @param event Electron invoke event.
 * @param workspace The workspace object to save.
 */
export async function saveWorkspace(workspace: Workspace) {
  try {
    fs.writeFileSync(
      workspaceFilePath,
      JSON.stringify(workspace, null, 2),
      'utf-8'
    );
  }
  catch (error: any) {
    console.warn('Fail to save workspace:', error.message);
  }
}

/**
 * Opens a project from disk.
 *
 * @param path The project file absolute path.
 * @returns The project object or undefined if project can't be opened.
 */
export async function openProject(path: string): Promise<Project> {
  const str = fs.readFileSync(path, 'utf-8');
  updateMenu(true);
  return JSON.parse(str);
}

/**
 * Marks has project to false, and updates application menu.
 */
export function closeProject() {
  updateMenu(false);
}

/**
 * Saves the project to disk.
 *
 * @param event Electron invoke event.
 * @param project
 */
export async function saveProject(path: string, project: Project) {
  fs.writeFileSync(path, JSON.stringify(project, null, 2), 'utf-8');
}

/**
 * Shows new project dialog.
 *
 * @param event Electron invoke event.
 * @param name The project filename.
 * @returns The path of the new project file.
 */
export async function showNewProjectDialog(name: string): Promise<string | undefined> {
  const window = getWindow();

  if (!window) {
    return;
  }

  const res = await dialog.showSaveDialog(window, {
    title: 'New Project',
    defaultPath: name
  });


  if (!res.canceled && res.filePath) {
    const ext = '.inflight.json';
    const filePath = res.filePath.endsWith(ext) ? res.filePath : `${res.filePath}${ext}`;
    fs.writeFileSync(filePath, JSON.stringify(new CProject(name), null, 2), 'utf-8');
    return filePath;
  }
}

/**
 * Sends the HTTP request.
 *
 * @param request The request object to send
 * @returns The result object that contains the request info that's sent and the response object.
 */
export async function sendRequest(request: Request): Promise<RequestResult> {
  // Make https/http module request options.
  const requestOptions = makeRequestOptions(request);

  if (request.auth?.type === 'aws_sigv4') {
    await signRequestSigv4(requestOptions, request);
  }

  // Additional headers
  if (request.headers && request.headers.length > 0) {
    requestOptions.headers = {
      ...requestOptions.headers,
    }
  }

  // const await makeRequestOptionsForAws(request);
  const resp = await client.sendRequest(requestOptions, request);
  return {
    requestOptions,
    response: resp
  };
}

/**
 * Loads history from disk.
 *
 * @returns A list of history entries or undefined if the file does not exist.
 */
export async function openHistory(): Promise<History | undefined> {
  try {
    const str = fs.readFileSync(historyFilePath, 'utf-8');
    return JSON.parse(str);
  }
  catch (error) {
    return;
  }
}

/**
 * Saves history to disk.
 *
 * @param history The history object to save.
 */
export async function saveHistory(history: History) {
  try {
    fs.writeFileSync(
      historyFilePath,
      JSON.stringify(history, null, 2),
      'utf-8'
    );
  }
  catch (error: any) {
    console.warn('Fail to save history:', error.message);
  }
}
