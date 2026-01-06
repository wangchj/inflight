import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { nanoid } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { projectSlice } from "renderer/redux/project-slice";
import { RootState } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import { workspaceSlice } from "renderer/redux/workspace-slice";
import * as Persistence from "renderer/utils/persistence";

export function NewVariantModal() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newVariantOpen]);

  /**
   * Handles create button click event.
   */
  async function onCreateClick() {
    if (!name) {
      return;
    }

    const id = nanoid();
    const parentId = ui.newVariantParentId;
    dispatch(projectSlice.actions.newVariant({id, name, parentId}));
    dispatch(workspaceSlice.actions.openVariant({id}));
    dispatch(workspaceSlice.actions.expandTreeNode(parentId));

    try {
      await Persistence.saveProject();
    }
    catch (error) {
      console.error("Error saving project", error);
    }

    dispatch(uiSlice.actions.closeNewVariantModal());
  }

  return (
    <Modal
      opened={ui.newVariantOpen}
      title={<Title order={3}>New Variant</Title>}
      onClose={() => dispatch(uiSlice.actions.closeNewVariantModal())}
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
