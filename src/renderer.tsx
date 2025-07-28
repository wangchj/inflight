/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/latest/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from '@mantine/core';
import { notifications, Notifications } from '@mantine/notifications';
import { loader } from '@monaco-editor/react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { dispatch, store } from 'renderer/redux/store';
import { App } from 'renderer/ui/app';
import onSave from "renderer/utils/on-save";
import * as Persistence from 'renderer/utils/persistence';
import { Project } from 'types/project';
import { Request } from 'types/request';
import { Workspace } from 'types/workspace';
import { RequestResult } from 'types/request-result';
import { projectSlice } from 'renderer/redux/project-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		return 'vs/base/worker/workerMain.js';
	}
};

loader.config({ paths: { vs: 'vs' } });

declare global {
  interface Window {
    openWorkspace: () => Promise<Workspace>;
    saveWorkspace: (workspace: Workspace) => Promise<void>;
    openProject: (path: string) => Promise<Project>;
    saveProject: (path: string, project: Project) => Promise<void>;
    sendRequest: (request: Request) => Promise<RequestResult>;
    showOpenProjectDialog: () => Promise<string>;
    showNewProjectDialog: () => Promise<string>;
    onSave: (callback: () => void) => void;
    onOpenProject: (callback: (filePath: string) => void) => void;
    onCloseProject: (callback: () => void) => void;
    onCloseTab: (callback: () => void) => void;
    monaco: any;
    printWorkspace: () => void;
    printProject: () => void;
    printResults: () => void;
    printUi: () => void;
    printPersistence: () => void;
    getFilePath: (file: any) => string;
  }
}

const theme = createTheme({
  /** Put your mantine theme override here */
});

createRoot(document.querySelector('#root')).render(
  <Provider store={store}>
    <MantineProvider theme={theme}>
      <App/>
      <Notifications autoClose={false} position="bottom-left"/>
    </MantineProvider>
  </Provider>
);

/**
 * Handles the save event from app menu.
 */
window.onSave(() => {
  onSave();
});

/**
 * Handles open project event from app menu.
 */
window.onOpenProject(async filePath => {
  try {
    const project = await Persistence.openProject(filePath);

    if (project) {
      dispatch(projectSlice.actions.setProject(project));
      dispatch(workspaceSlice.actions.openProject(filePath));
    }
  }
  catch (error) {
    notifications.show({
      id: 'openProject',
      color: 'red',
      title: 'Unable to open project',
      message: (error instanceof Error ? error.message : String(error)),
      withBorder: true,
    });
  }
});

/**
 * Handles close project event from app menu.
 */
window.onCloseProject(async () => {
  const workspace = store.getState().workspace;
  const project = store.getState().project;

  if (!project || !workspace.projectPath) {
    return;
  }

  dispatch(projectSlice.actions.closeProject());
  dispatch(workspaceSlice.actions.closeProject());
});

window.onCloseTab(() => {
  dispatch(workspaceSlice.actions.closeResource());
});
