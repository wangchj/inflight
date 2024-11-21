import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { TreeNode } from 'types/tree-node';
import { Workspace } from 'types/workspace';
import { Request } from 'types/request';

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
  },
});

// Action creators are generated for each case reducer function
export const { openRequest, setWorkspace } = workspaceSlice.actions
export default workspaceSlice.reducer
