import { History } from "./history";
import { Project } from "./project";
import { Request } from "./request";
import { RequestResult } from "./request-result";
import { Workspace } from "./workspace";

/**
 * Electron IPC bridge.
 */
export interface Bridge {
  openWorkspace: () => Promise<Workspace>;
  saveWorkspace: (workspace: Workspace) => Promise<void>;
  openProject: (path: string) => Promise<Project>;
  closeProject: () => Promise<void>;
  saveProject: (path: string, project: Project) => Promise<void>;
  showOpenProjectDialog: () => Promise<string>;
  showNewProjectDialog: (name?: string) => Promise<string>;
  sendRequest: (request: Request) => Promise<RequestResult>;
  openHistory: () => Promise<History>;
  saveHistory: (history: History) => Promise<void>;
  on: (name: string, listener: (event: any, ...args: any[]) => void) => void;
  getFilePath: (file: any) => string;
}
