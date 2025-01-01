import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";

export function NewFolderModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newFolderModalOpen]);

  /**
   * Handles create button click event.
   */
  async function onCreateClick() {
    dispatch(projectSlice.actions.newFolder({name, parentId: ui.newFolderParentId}));

    try {
      await window.saveProject(workspace.projectRef.$ref, store.getState().project);
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeNewFolderModal());
  }

  return (
    <Modal
      opened={ui.newFolderModalOpen}
      title={<Title order={3}>New Folder</Title>}
      onClose={() => dispatch(uiSlice.actions.closeNewFolderModal())}
      centered
    >
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={event => setName(event.currentTarget.value)}
        />

        <div style={{display: 'flex', justifyContent: 'right'}}>
          <Button onClick={onCreateClick}>Create</Button>
        </div>
      </Stack>
    </Modal>
  )
}
