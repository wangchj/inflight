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
import { createTheme, Button, Input, MantineProvider, rem, Select } from '@mantine/core';
import { notifications, Notifications } from '@mantine/notifications';
import { loader } from '@monaco-editor/react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { dispatch, store } from 'renderer/redux/store';
import { App } from 'renderer/ui/app';
import onCloseProject from 'renderer/utils/on-close-project';
import onSave from 'renderer/utils/on-save';
import * as Persistence from 'renderer/utils/persistence';
import { History } from 'types/history';
import { Project } from 'types/project';
import { Request } from 'types/request';
import { Workspace } from 'types/workspace';
import { RequestResult } from 'types/request-result';
import * as Env from "renderer/utils/env";
import { projectSlice } from 'renderer/redux/project-slice';
import { workspaceSlice } from 'renderer/redux/workspace-slice';
import 'renderer/ui/app.css';
import './preload-web';

self.MonacoEnvironment = {
	getWorkerUrl: function (moduleId, label) {
		return WEB_BUILD ? 'vs/base/worker/workerMain.js' : '../vs/base/worker/workerMain.js';
	}
};

loader.config({ paths: { vs: WEB_BUILD ? 'vs' : '../vs' } });

declare global {
  interface Window {
    openWorkspace: () => Promise<Workspace>;
    saveWorkspace: (workspace: Workspace) => Promise<void>;
    openProject: (path: string) => Promise<Project>;
    closeProject: () => Promise<void>;
    saveProject: (path: string, project: Project) => Promise<void>;
    openHistory: () => Promise<History>;
    saveHistory: (history: History) => Promise<void>;
    sendRequest: (request: Request) => Promise<RequestResult>;
    showOpenProjectDialog: () => Promise<string>;
    showNewProjectDialog: (name?: string) => Promise<string>;
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
    printHistory: () => void;
    getFilePath: (file: any) => string;
  }
}

const theme = createTheme({
  colors: {
    dark: [
      '#C9C9C9', // 0, default: #C9C9C9
      '#b8b8b8', // 1, default: #b8b8b8
      '#828282', // 2, default: #828282
      '#696969', // 3, default: #696969
      '#333333', // 4, default: #424242
      '#2f2f2f', // 5, default: #3b3b3b
      '#232323', // 6, default: #2e2e2e
      '#1e1e1e', // 7, default: #242424
      '#181818', // 8, default: #1f1f1f
      '#141414', // 9, default: #141414
    ]
  },
  fontSizes: {
    xs: rem(10),
    sm: rem(12), // 12px default
    md: rem(14),
    lg: rem(16),
    xl: rem(20),
  },
  // spacing: {
  //   xs: rem(8),
  //   sm: rem(10), // Tighter global padding rules
  //   md: rem(12),
  //   lg: rem(16),
  //   xl: rem(24),
  // },
  lineHeights: {
    xs: '1.1',
    sm: '1.2',
    md: '1.35',
    lg: '1.45',
    xl: '1.6',
  },
  components: {
    // 1. Adjust Buttons globally
    Button: Button.extend({
      vars: (theme, props) => {
        // If the user uses the default size (sm), override its dimensions
        if (props.size === 'sm' || !props.size) {
          return {
            root: {
              '--button-height': rem(30),      // Drop default height from 36px to 30px
              '--button-padding-x': rem(12),   // Tighten horizontal padding
            },
          };
        }
        return { root: {} };
      },
    }),

    // 2. Adjust Inputs globally (TextInput, Select, Textarea, NumberInput, etc.)
    Input: Input.extend({
      vars: (theme, props) => {
        if (props.size === 'sm' || !props.size) {
          return {
            wrapper: {
              '--input-height': rem(30),       // Drop default input height to 30px
              '--input-padding-y': rem(4),     // Tighter vertical balance
            },
          };
        }
        return { wrapper: {} };
      },
    }),

    Select: Select.extend({
      styles: {
        // 1. Target the actual input box
        input: {
          paddingLeft: rem(8),
          // Note: We don't recommend manually overriding paddingRight
          // too aggressively here, otherwise your text might overlap the chevron/clear icon.
        },

        // 2. Target the outer shell of the dropdown menu
        dropdown: {
          padding: rem(4), // Reduces the white space around the edge of the dropdown
        },

        // 3. Target the individual selectable items in the list
        option: {
          padding: `${rem(4)} ${rem(8)}`, // 4px top/bottom, 8px left/right
          fontSize: rem(12),              // Ensure options match your dense font size
          minHeight: rem(26),             // Override the default 36px min-height for items
        },
      },
    }),
  },
});

createRoot(document.querySelector('#root')).render(
  <Provider store={store}>
    <MantineProvider theme={theme} defaultColorScheme="auto">
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
 * Handles cmd+s (ctrl+s) keyboard shortcut for web build.
 */
if (WEB_BUILD) {
  window.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === 's') {
      event.preventDefault();
      event.stopPropagation();
      onSave();
    }
  });
}

/**
 * Handles open project event from app menu.
 */
window.onOpenProject(async filePath => {
  try {
    const project = await Persistence.openProject(filePath);

    if (project) {
      dispatch(projectSlice.actions.setProject(project));
      dispatch(workspaceSlice.actions.openProject(filePath));
      Env.combine(project, {});
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
  onCloseProject();
});

window.onCloseTab(() => {
  dispatch(workspaceSlice.actions.closeResource());
});