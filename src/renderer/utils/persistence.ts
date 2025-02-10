import { Project } from "types/project";
import { Workspace } from "types/workspace";

/**
 * Determines if the workspace model has been updated and not flushed to storage (disk).
 */
export let workspaceDirty = false;

/**
 * Determines if the project model has been updated and not flushed to storage (disk).
 */
export let projectDirty = false;

/**
 * Sets the workspace dirty flag to true.
 */
export function setWorkspaceDirty() {
  workspaceDirty = true;
}

/**
 * Gets the workspace dirty flag.
 *
 * @returns True or false.
 */
export function getWorkspaceDirty() {
  return workspaceDirty;
}

/**
 * Sets the project dirty flag to true.
 */
export function setProjectDirty() {
  projectDirty = true;
}

/**
 * Gets the project dirty flag.
 *
 * @returns True or false.
 */
export function getProjectDirty() {
  return projectDirty;
}

/**
 * Loads workspace from storage.
 */
export async function openWorkspace(): Promise<Workspace> {
  const workspace = await window.openWorkspace();
  workspaceDirty = false;
  return workspace;
}

/**
 * Flushes workspace to storage (disk).
 *
 * @param workspace The workspace model object to save.
 */
export async function saveWorkspace(workspace: Workspace) {
  if (!workspace) {
    throw new Error('Workspace is not saved because it is undefined.');
  }

  if (workspaceDirty) {
    await window.saveWorkspace(workspace);
    workspaceDirty = false;
  }
}

/**
 * Loads project from storage.
 *
 * @param path The project file path.
 */
export async function openProject(path: string): Promise<Project> {
  const project = path ? await window.openProject(path) : undefined;
  projectDirty = false;
  return project;
}

/**
 * Flushes project to storage (disk).
 *
 * @param path The project file path.
 * @param project The project model object to save.
 */
export async function saveProject(path: string, project: Project) {
  if (!path) {
    throw new Error('Project is not saved because path is not specified.');
  }

  if (!project) {
    throw new Error('Project is not saved because it is undefined.');
  }


  if (projectDirty) {
    await window.saveProject(path, project);
    projectDirty = false;
  }
}
