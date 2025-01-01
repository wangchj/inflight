import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  newFolderModalOpen: boolean;
  newFolderParentId: string;
}

const initialState = {
  newFolderModalOpen: false
} as UiState;

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
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
  },
});

export default uiSlice.reducer
