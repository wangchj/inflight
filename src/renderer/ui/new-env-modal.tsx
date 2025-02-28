import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";

export function NewEnvModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newEnvOpen]);

  /**
   * Handles create button click event.
   */
  async function onCreateClick() {
    const id = nanoid();
    const parentId = ui.newEnvParentId;
    dispatch(projectSlice.actions.newEnv({id, name, parentId}));
    dispatch(workspaceSlice.actions.openEnv({id}));
    dispatch(workspaceSlice.actions.expandTreeNode(parentId));

    try {
      await Persistence.saveProject(workspace.projectPath, store.getState().project);
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeNewEnvModal());
  }

  return (
    <Modal
      opened={ui.newEnvOpen}
      title={<Title order={3}>New Environment</Title>}
      onClose={() => dispatch(uiSlice.actions.closeNewEnvModal())}
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
