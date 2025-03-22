import { projectSlice } from "renderer/redux/project-slice";
import { dispatch, store } from "renderer/redux/store";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import { openSaveRequestModal } from "renderer/ui/save-request-modal";
import * as Persistence from "renderer/utils/persistence";

export default async function onSave() {
  const workspace = store.getState().workspace;
  const project = store.getState().project;
  const openedResource = workspace?.openedResources?.[workspace?.selectedResourceIndex];
  const request = openedResource?.props?.request;

  if (!workspace || !project || !request) {
    return;
  }

  if (openedResource.props.folderId) {
    if (openedResource.dirty) {
      dispatch(projectSlice.actions.setRequest({id: openedResource.id, request}));

      try {
        await Persistence.saveProject();
        dispatch(workspaceSlice.actions.setDirty(false));
        await Persistence.saveWorkspace();
      }
      catch (error) {
        throw new Error(`Error saving request: ${error}`);
      }
    }
  }
  else {
    openSaveRequestModal(openedResource);
  }
}
