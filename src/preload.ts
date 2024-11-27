// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron'
import { Project } from 'types/project';
import { Request } from 'types/request';
import { Workspace } from 'types/workspace';

contextBridge.exposeInMainWorld('openWorkspace',
  () => ipcRenderer.invoke('openWorkspace')
);

contextBridge.exposeInMainWorld('saveWorkspace',
  (workspace: Workspace) => ipcRenderer.invoke('saveWorkspace', workspace)
);

contextBridge.exposeInMainWorld('openProject',
  (path: string) => ipcRenderer.invoke('openProject', path)
);

contextBridge.exposeInMainWorld('saveProject',
  (path: string, project: Project) => ipcRenderer.invoke('saveProject', path, project)
);

contextBridge.exposeInMainWorld('loadProject',
  () => ipcRenderer.invoke('loadProject')
);

contextBridge.exposeInMainWorld('sendRequest',
  (request: Request) => ipcRenderer.invoke('sendRequest', request)
);

contextBridge.exposeInMainWorld('onFlushWorkspace',
  (callback: () => void) => ipcRenderer.on('flush-workspace', () => callback())
)

