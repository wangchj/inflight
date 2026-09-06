import { projectSlice } from "renderer/redux/project-slice";
import { dispatch, store } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";

export default async function onCloseProject() {
  const workspace = store.getState().workspace;
  const project = store.getState().project;

  if (!project || !workspace.projectPath) {
    return;
  }

  dispatch(projectSlice.actions.closeProject());
  dispatch(workspaceSlice.actions.closeProject());
  Persistence.saveWorkspace();
  window.bridge.closeProject();
}
