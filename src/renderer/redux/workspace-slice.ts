import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TreeNode } from 'types/tree-node';
import { Workspace } from 'types/workspace';

const initialState: Workspace = {};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    /**
     * Sets the workspace state object.
     *
     * @param state The current state
     * @param action The action object.
     * @returns The new workspace object.
     */
    setWorkspace(state, action: PayloadAction<Workspace>) {
      return action.payload;
    },

    /**
     * Add a request to opened requests.
     *
     * @param state The workspace object.
     * @param action The action.
     */
    openRequest(state, action: PayloadAction<TreeNode>) {
      const node = action.payload;

      // Check if the request is already opened.
      const opened = Array.isArray(state.openedRequests) &&
        state.openedRequests.reduce((acc, curr) => acc || curr.path === node.value, false);

      // If not already opened, add to opened requests.
      if (!opened) {
        if (!Array.isArray(state.openedRequests)) {
          state.openedRequests = [];
        }

        state.openedRequests.push({
          path: node.value,
          request: JSON.parse(JSON.stringify(node.item)) // Deep copy
        });
      }

      state.selectedRequest = node.value;
    },

    /**
     * Closes an opened request.
     *
     * @param state The workspace state.
     * @param action The action that contains the id of the request to close.
     */
    closeRequest(state, action: PayloadAction<string>) {
      const openedRequests = state.openedRequests;

      if (!openedRequests || openedRequests.length === 0) {
        return;
      }

      state.openedRequests = openedRequests.filter(
        openRequest => openRequest.path !== action.payload
      );

      if (state.openedRequests.length === 0) {
        delete state.selectedRequest;
      }
      else if (state.selectedRequest === action.payload) {
        state.selectedRequest = state.openedRequests[0].path;
      }
    },

    /**
     * Sets the selected request.
     *
     * @param state The workspace state
     * @param action The action that contains the selected request path (id).
     */
    setSelectedRequest(state, action: PayloadAction<string>) {
      state.selectedRequest = action.payload;
    },
  },
});

export default workspaceSlice.reducer
