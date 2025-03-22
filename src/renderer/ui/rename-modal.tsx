import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";
import resourceName from "renderer/utils/resource-name";

export function RenameModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const ui = useSelector((state: RootState) => state.ui);
  const node = ui.renameNode;
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (node?.label) {
      setName(node?.label as string);
    }
  }, [ui.renameModalOpen]);

  /**
   * Handles rename button click event.
   */
  async function onRenameClick() {
    if (!name) {
      return;
    }

    dispatch(projectSlice.actions.renameResource({
      id: node.value,
      type: node.nodeProps?.type,
      name
    }));

    dispatch(workspaceSlice.actions.renameResource({
      id: node.value,
      name
    }));

    try {
      await Persistence.saveProject();
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeRenameModal());
  }

  return (
    <Modal
      opened={ui.renameModalOpen}
      title={<Title order={3}>Rename {resourceName(node, true)}</Title>}
      onClose={() => dispatch(uiSlice.actions.closeRenameModal())}
      centered
    >
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={event => setName(event.currentTarget.value)}
          onKeyDown={event => event.key === 'Enter' ? onRenameClick() : null}
          data-autofocus
        />

        <div style={{display: 'flex', justifyContent: 'right'}}>
          <Button onClick={onRenameClick}>Rename</Button>
        </div>
      </Stack>
    </Modal>
  )
}
