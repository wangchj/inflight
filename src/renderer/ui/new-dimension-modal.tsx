import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import * as Persistence from "renderer/utils/persistence";

export function NewDimensionModal() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newDimensionOpen]);

  /**
   * Handles create button click event.
   */
  async function onCreateClick() {
    if (!name) {
      return;
    }

    dispatch(projectSlice.actions.newDimension({name}));

    try {
      await Persistence.saveProject();
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeNewDimensionModal());
  }

  return (
    <Modal
      opened={ui.newDimensionOpen}
      title={<Title order={3}>New Dimension</Title>}
      onClose={() => dispatch(uiSlice.actions.closeNewDimensionModal())}
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
