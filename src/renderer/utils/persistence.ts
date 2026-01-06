import { migrateProject } from "model/migrate-project";
import { migrateWorkspace } from "model/migrate-workspace";
import { store } from "renderer/redux/store";
import { Project } from "types/project";
import { Workspace } from "types/workspace";

/**
 * Save workspace timeout id.
 */
let saveWorkspaceTimeout: number;

/**
 * Save project timeout id.
 */
let saveProjectTimeout: number;

/**
 * Loads workspace from storage.
 */
export async function openWorkspace(): Promise<Workspace> {
  let workspace = await window.openWorkspace();
  workspace = migrateWorkspace(workspace);

  clearTimeout(saveWorkspaceTimeout);
  return workspace;
}

/**
 * Flushes workspace to storage (disk).
 *
 * @param workspace The workspace model object to save.
 */
export async function saveWorkspace() {
  clearTimeout(saveWorkspaceTimeout);

  const workspace = store.getState().workspace;

  if (!workspace) {
    throw new Error('Workspace is not saved because it is undefined.');
  }

  await window.saveWorkspace(workspace);
}

/**
 * Saves the workspace to storage (disk) with a short delay so that multiple saves are batched.
 */
export function saveWorkspaceDelay() {
  clearTimeout(saveWorkspaceTimeout);

  saveWorkspaceTimeout = window.setTimeout(() => {
    const workspace = store.getState().workspace;

    if (!workspace) {
      throw new Error('Workspace is not saved because it is undefined.');
    }

    window.saveWorkspace(workspace);
  }, 500);
}

/**
 * Loads project from storage.
 *
 * @param path The project file path.
 */
export async function openProject(path: string): Promise<Project> {
  let project = path ? await window.openProject(path) : undefined;
  project = migrateProject(project);

  clearTimeout(saveProjectTimeout);
  return project;
}

/**
 * Flushes project to storage (disk).
 *
 * @param path The project file path.
 * @param project The project model object to save.
 */
export async function saveProject() {
  clearTimeout(saveProjectTimeout);

  const workspace = store.getState().workspace;
  const project = store.getState().project;

  if (!workspace?.projectPath) {
    throw new Error('Project is not saved because path is not specified.');
  }

  if (!project) {
    throw new Error('Project is not saved because it is undefined.');
  }

  await window.saveProject(workspace.projectPath, project);
}

/**
 * Saves the project to storage (disk) with a short delay so that multiple saves are batched.
 */
export function saveProjectDelay() {
  clearTimeout(saveWorkspaceTimeout);
  saveWorkspaceTimeout = window.setTimeout(() => saveProject(), 500);
}
