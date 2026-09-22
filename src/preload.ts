// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { Bridge } from 'types/bridge';
import { History } from 'types/history';
import { Project } from 'types/project';
import { Request } from 'types/request';
import { Workspace } from 'types/workspace';

/**
 * Invokes a handler in the main process.
 *
 * @param args The invoke parameters. The first must be the name of the main process handler
 * followed by optional handler parameters.
 * @return The handler response.
 */
function invoke(...args: any[]): Promise<any> {
  if (!Array.isArray(args) || args.length === 0) {
    return Promise.reject();
  }

  return ipcRenderer.invoke('invoke', ...args);
}

/**
 * The IPC bridge.
 */
const bridge: Bridge = {
  openAppState: () => invoke('openAppState'),
  openWorkspace: (projPath: string) => invoke('openWorkspace', projPath),
  saveWorkspace: (projPath: string, workspace: Workspace) => invoke('saveWorkspace', projPath, workspace),
  openProject: (path: string) => invoke('openProject', path),
  closeProject: () => invoke('closeProject'),
  saveProject: (path: string, project: Project) => invoke('saveProject', path, project),
  showOpenProjectDialog: () => invoke('showOpenProjectDialog'),
  showNewProjectDialog: (name?: string) => invoke('showNewProjectDialog', name),
  sendRequest: (request: Request) => invoke('sendRequest', request),
  openHistory: () => invoke('openHistory'),
  saveHistory: (history: History) => invoke('saveHistory', history),
  readFile: (path: string) => invoke('readFile', path),
  on: (name: string, listener: (event: any, ...args: any[]) => void) => ipcRenderer.on(name, listener),
  getFilePath: (file: any) => webUtils.getPathForFile(file),
};

contextBridge.exposeInMainWorld('bridge', bridge);
contextBridge.exposeInMainWorld('MAC_BUILD', process.platform === 'darwin');
contextBridge.exposeInMainWorld('WIN_BUILD', process.platform === 'win32');
