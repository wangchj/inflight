import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import * as Persistence from "renderer/utils/persistence";

export function NewEnvGroupModal() {
  const dispatch = useDispatch();
  const workspace = useSelector((state: RootState) => state.workspace);
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newEnvGroupOpen]);

  /**
   * Handles create button click event.
   */
  async function onCreateClick() {
    if (!name) {
      return;
    }

    dispatch(projectSlice.actions.newEnvGroup({name, parentId: ui.newEnvGroupParentId}));

    try {
      await Persistence.saveProject(workspace.projectPath, store.getState().project);
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeNewEnvGroupModal());
  }

  return (
    <Modal
      opened={ui.newEnvGroupOpen}
      title={<Title order={3}>New Environment Group</Title>}
      onClose={() => dispatch(uiSlice.actions.closeNewEnvGroupModal())}
      centered
    >
      <Stack>
        <TextInput
          label="Name"
          value={name}
          onChange={event => setName(event.currentTarget.value)}
          onKeyDown={event => event.key === 'Enter' ? onCreateClick() : null}
          data-autofocus
        />

        <div style={{display: 'flex', justifyContent: 'right'}}>
          <Button onClick={onCreateClick}>Create</Button>
        </div>
      </Stack>
    </Modal>
  )
}
