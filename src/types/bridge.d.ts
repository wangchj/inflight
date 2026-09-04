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
  onSaveMenuItemSelect: (callback: () => void) => void;
  onOpenProjectMenuItemSelect: (callback: (filePath: string) => void) => void;
  onCloseProjectMenuItemSelect: (callback: () => void) => void;
  onCloseTabMenuItemSelect: (callback: () => void) => void;
  getFilePath: (file: any) => string;
}
