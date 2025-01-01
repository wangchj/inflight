import { Button, Code, Modal, Stack, Title } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import getDescendantRequestIds from "renderer/utils/get-descendant-request-ids";

export function DeleteModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const project = useSelector((state: RootState) => state.project);
  const ui = useSelector((state: RootState) => state.ui);
  const node = ui.nodeToDelete;
  const title = `Delete ${node?.nodeProps.type === 'folder' ? 'Folder' : 'Request'}`

  /**
   * Handles create button click event.
   */
  async function onDeleteClick() {
    switch (node.nodeProps.type) {
      case 'folder':
        const requestIds = getDescendantRequestIds(project, node.value);
        requestIds.forEach(i => dispatch(workspaceSlice.actions.closeRequest(i)));
        dispatch(projectSlice.actions.deleteFolder({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;

      case 'request':
        dispatch(workspaceSlice.actions.closeRequest(node.value));
        dispatch(projectSlice.actions.deleteRequest({
          id: node.value,
          parentId: node.nodeProps.parentId
        }));
        break;
    }

    try {
      await window.saveProject(workspace.projectRef.$ref, store.getState().project);
      await window.saveWorkspace(store.getState().workspace);
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
      centered
    >
      <Stack>
        <div>Delete {node?.nodeProps.type} <Code>{node?.label}</Code>?</div>
        <div style={{display: 'flex', justifyContent: 'right'}}>
          <Button color="red" onClick={onDeleteClick}>Delete</Button>
        </div>
      </Stack>
    </Modal>
  )
}
