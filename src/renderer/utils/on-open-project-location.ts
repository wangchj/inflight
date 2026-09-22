import { notifications } from '@mantine/notifications';
import { projectSlice } from "renderer/redux/project-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { dispatch } from "renderer/redux/store";
import * as Env from './env';
import * as Persistence from "./persistence";

/**
 * Opens a project from path.
 *
 * @param path The project path.
 */
export async function openProject(path: string) {
  if (!path || typeof path !== 'string') {
    return;
  }

  console.log('--------openProject path', path)
  if (path.endsWith('/')) {
    // openDirProject(path);
  }
  else if (path.endsWith('.json')) {
    openFileProject(path);
  }
}

// async function openDirProject(path: string) {

// }

/**
 * Opens a file project.
 *
 * @param path The path of the project.
 */
async function openFileProject(path: string) {
  try {
    const project = await Persistence.openProject(path);

    if (project) {
      dispatch(projectSlice.actions.setProject(project));
      dispatch(workspaceSlice.actions.openProject(path));
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
}
