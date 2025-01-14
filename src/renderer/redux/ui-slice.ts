import { TreeNodeData } from '@mantine/core';
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type NavItem = 'requests' | 'environments';

interface UiState {
  selectedNavItem: NavItem;

  newFolderModalOpen: boolean;
  newFolderParentId: string;

  deleteModalOpen: boolean;
  nodeToDelete: TreeNodeData;
}

const initialState = {
  newFolderModalOpen: false,
  deleteModalOpen: false,
  selectedNavItem: 'requests',
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
  },
});

export default uiSlice.reducer
