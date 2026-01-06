import { Button, Code, Modal, Stack, Title } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import * as Persistence from "renderer/utils/persistence";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Env from "renderer/utils/env";
import getDescendantRequestIds from "renderer/utils/get-descendant-request-ids";
import resourceName from "renderer/utils/resource-name";

export function DeleteModal() {
  const dispatch = useDispatch();
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

      case 'dimension':
        const variants = project.dimensions?.[node.value]?.variants ?? [];
        variants.forEach(i => dispatch(workspaceSlice.actions.closeResource(i)));
        dispatch(projectSlice.actions.deleteDimension({dimId: node.value}));
        dispatch(workspaceSlice.actions.deleteSelectedVariant({dimId: node.value}));
        Env.combine(project, store.getState().workspace.selectedVariants);
        break;

      case 'variant':
        dispatch(workspaceSlice.actions.closeResource(node.value));
        dispatch(projectSlice.actions.deleteVariant({
          id: node.value,
          dimId: node.nodeProps.parentId
        }));
        dispatch(workspaceSlice.actions.deleteSelectedVariant({varId: node.value}));
        Env.combine(project, store.getState().workspace.selectedVariants);
        break;
    }

    dispatch(workspaceSlice.actions.deleteTreeExpandedState(node.value));

    try {
      await Persistence.saveProject();
      await Persistence.saveWorkspace();
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
