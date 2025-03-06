import { Button, Code, Modal, Stack, Title, TreeNodeData } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import * as Persistence from "renderer/utils/persistence";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import getDescendantRequestIds from "renderer/utils/get-descendant-request-ids";
import getDescendantEnvIds from "renderer/utils/get-descendant-env-ids";
import resourceName from "renderer/utils/resource-name";

export function DeleteModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const ui = useSelector((state: RootState) => state.ui);
  const node = ui.nodeToDelete;
  const title = `Delete ${resourceName(node, true)}`;

  /**
   * Handles create button click event.
   */
  async function onDeleteClick() {
    switch (node.nodeProps.type) {
      case 'folder':
        const requestIds = getDescendantRequestIds(project, node.value);
        requestIds.forEach(i => dispatch(workspaceSlice.actions.closeResource(i)));
        dispatch(projectSlice.actions.deleteFolder({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'request':
        dispatch(workspaceSlice.actions.closeResource(node.value));
        dispatch(projectSlice.actions.deleteRequest({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'envGroup':
        var resIds = getDescendantEnvIds(project, node.value, 'envGroup');
        resIds.forEach(i => dispatch(workspaceSlice.actions.closeResource(i)));
        dispatch(projectSlice.actions.deleteEnvGroup({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'env':
        var resIds = getDescendantEnvIds(project, node.value, 'env');
        resIds.forEach(i => dispatch(workspaceSlice.actions.closeResource(i)));
        dispatch(projectSlice.actions.deleteEnv({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;
    }

    try {
      await Persistence.saveProject(workspace.projectPath, store.getState().project);
      await Persistence.saveWorkspace(store.getState().workspace);
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeDeleteModal());
  }

  return (
    <Modal
      opened={ui.deleteModalOpen}
      title={<Title order={3}>{title}</Title>}
      onClose={() => dispatch(uiSlice.actions.closeDeleteModal())}
      onKeyDown={event => event.key === 'Enter' ? onDeleteClick() : null}
      centered
    >
      <Stack>
        <div>Delete {resourceName(node)} <Code>{node?.label}</Code>?</div>
        <div style={{display: 'flex', justifyContent: 'right'}}>
          <Button color="red" onClick={onDeleteClick}>Delete</Button>
        </div>
      </Stack>
    </Modal>
  )
}
