import { Button, Modal, Stack, TextInput, Title } from "@mantine/core";
import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Determines if the modal is open.
 */
let open: boolean;

/**
 * Sets the open state of the modal.
 */
let setOpen: Dispatch<SetStateAction<boolean>>;

/**
 * The user input value.
 */
let value: string;

/**
 * Sets the input value.
 */
let setValue: Dispatch<SetStateAction<string>>;

/**
 * Modal title.
 */
let title;

/**
 * Sets modal title.
 */
let setTitle: Dispatch<SetStateAction<string>>;

/**
 * Confirmation button label.
 */
let confirmLabel: string;

/**
 * Sets confirmation button label.
 */
let setConfirmLabel: Dispatch<SetStateAction<string>>;

/**
 * The modal promise resolve function.
 */
let resolve: (value: string | null) => void;

/**
 * The modal promise reject function.
 */
let reject: (reason?: unknown) => void;

/**
 * The openModal() function params.
 */
interface OpenParams {
  title: string;
  value: string;
  confirmLabel: string;
}

/**
 * Opens the modal.
 *
 * @param params Modal parameters.
 */
export function openInputModal(params: OpenParams): Promise<string> {
  setTitle(params.title ?? 'User input');
  setValue(params.value ?? '');
  setConfirmLabel(params.confirmLabel ?? 'Confirm');

  setOpen(true);

  return new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
}

/**
 * Handles confirm button click event.
 */
function onConfirmClick() {
  if (!value) {
    return;
  }

  resolve(value);
  setOpen(false);
}

/**
 * Handles close model button event.
 */
function onCloseClick() {
  resolve(null);
  setOpen(false);
}

/**
 * The modal UI component.
 */
export function InputModal() {
  [open, setOpen] = useState(false);
  [value, setValue] = useState('');
  [title, setTitle] = useState('');
  [confirmLabel, setConfirmLabel] = useState('Confirm');

  return (
    <Modal
      opened={open}
      title={<Title order={3}>{title}</Title>}
      onClose={onCloseClick}
      centered
    >
      <Stack>
        <TextInput
          label="Name"
          value={value}
          onChange={event => setValue(event.currentTarget.value)}
          onKeyDown={event => event.key === 'Enter' ? onConfirmClick() : null}
          data-autofocus
        />

        <div style={{ display: 'flex', justifyContent: 'right' }}>
          <Button onClick={onConfirmClick}>{confirmLabel}</Button>
        </div>
      </Stack>
    </Modal>
  );
}
