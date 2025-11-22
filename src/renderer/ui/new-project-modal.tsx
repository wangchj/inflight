import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";

/**
 * The promise resolve function. The promise is created when the openNewProjectModal() is called and
 * resolved when the modal is closed (create or closed is clicked).
 */
let resolve: (name?: string) => void;

/**
 * Opens the new project modal that allows the user to enter the name of the new project.
 *
 * @returns The name of the project entered by the user; or undefined, if the action is canceled.
 */
export async function openNewProjectModal(): Promise<string> {
  store.dispatch(uiSlice.actions.openNewProjectModal());

  return new Promise<string>((_resolve) => {
    resolve = _resolve;
  });
}

/**
 * The new project modal UI component. The purpose of this component is to allow the user to enter
 * the new project name. After the user clicks the create button, the promise is resolved with the
 * project name.
 */
export function NewProjectModal() {
  const dispatch = useDispatch();
  const ui = useSelector((state: RootState) => state.ui);
  const [name, setName] = useState<string>('');

  useEffect(() => {
    setName('');
  }, [ui.newProjectModalOpen]);

  /**
   * Handles close button click event.
   */
  function onCloseClick() {
    resolve();
    dispatch(uiSlice.actions.closeNewProjectModal());
  }

  /**
   * Handles create button click event.
   */
  function onCreateClick() {
    if (name.trim()) {
      resolve(name.trim());
      dispatch(uiSlice.actions.closeNewProjectModal());
    }
  }

  return (
    <Modal
      opened={ui.newProjectModalOpen}
      title={<Title order={3}>New Project</Title>}
      onClose={onCloseClick}
      centered
    >
      <Stack className="no-app-drag">
        <TextInput
          label="Project Name"
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
