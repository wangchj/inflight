import { TreeNodeData } from '@mantine/core';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type NavItem = 'requests' | 'environments';

interface UiState {
  selectedNavItem: NavItem;

  newFolderModalOpen: boolean;
  newFolderParentId: string;

  deleteModalOpen: boolean;
  nodeToDelete: TreeNodeData;

  newEnvGroupOpen: boolean;
  newEnvGroupParentId: string;

  newEnvOpen: boolean;
  newEnvParentId: string;

  renameModalOpen: boolean;
  renameNode: TreeNodeData;
}

const initialState = {
  newFolderModalOpen: false,
  deleteModalOpen: false,
  selectedNavItem: 'requests',
  renameModalOpen: false,
} as UiState;

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    /**
     * Sets the Navbar selected item.
     *
     * @param state The UI state.
     * @param action The payload is the select item name.
     */
    setSelectedNavItem(state, action: PayloadAction<NavItem>) {
      state.selectedNavItem = action.payload;
    },

    /**
     * Opens the new folder modal.
     *
     * @param state The UI state.
     * @param action The payload is the parent folder id.
     */
    openNewFolderModal(state, action: PayloadAction<string>) {
      state.newFolderParentId = action.payload;
      state.newFolderModalOpen = true;
    },

    /**
     * Closes the new folder modal.
     *
     * @param state The UI state.
     */
    closeNewFolderModal(state) {
      state.newFolderModalOpen = false;
    },

    /**
     * Opens the delete folder/request confirmation modal
     *
     * @param state The UI state.
     * @param action The payload is the item to delete.
     */
    openDeleteModal(state, action: PayloadAction<TreeNodeData>) {
      state.nodeToDelete = action.payload;
      state.deleteModalOpen = true;
    },

    /**
     * Closes the delete confirmation modal.
     *
     * @param state The UI state.
     */
    closeDeleteModal(state) {
      state.deleteModalOpen = false;
    },

    /**
     * Opens the new environment group modal.
     *
     * @param state The UI state.
     */
    openNewEnvGroupModal(state, action: PayloadAction<string>) {
      state.newEnvGroupOpen = true;
      state.newEnvGroupParentId = action.payload;
    },

    /**
     * Closes the new environment group modal.
     *
     * @param state The UI state.
     */
    closeNewEnvGroupModal(state) {
      state.newEnvGroupOpen = false;
    },

    /**
     * Opens the new environment modal.
     *
     * @param state The UI state.
     */
    openNewEnvModal(state, action: PayloadAction<string>) {
      state.newEnvOpen = true;
      state.newEnvParentId = action.payload;
    },

    /**
     * Closes the new environment modal.
     *
     * @param state The UI state.
     */
    closeNewEnvModal(state) {
      state.newEnvOpen = false;
    },

    /**
     * Opens rename modal.
     *
     * @param state The UI state.
     */
    openRenameModal(state, action: PayloadAction<TreeNodeData>) {
      state.renameModalOpen = true;
      state.renameNode = action.payload;
    },

    /**
     * Closes rename modal.
     *
     * @param state The UI state.
     */
    closeRenameModal(state) {
      state.renameModalOpen = false;
    },
  },
});

export default uiSlice.reducer
