import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import getDescendantFolderIds from 'renderer/utils/get-descendant-folder-ids';
import getDescendantRequestIds from 'renderer/utils/get-descendant-request-ids';
import { Project } from 'types/project';
import { Request } from 'types/request';

const initialState: Project = {
  name: ''
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    /**
     * Updates the entire project object.
     *
     * @param state The project object.
     * @param action Contains the new project object.
     */
    setProject(state, action: PayloadAction<Project>) {
      return action.payload;
    },

    /**
     * Set a request object inside the project.
     *
     * @param state The project object.
     * @param action The payload contains:
     *   - id: The request id
     *   - request: The request object.
     */
    setRequest(state, action: PayloadAction<{id: string; request: Request}>) {
      if (!state.requests) {
        state.requests = {};
      }

      state.requests[action.payload.id] = action.payload.request;
    },

    /**
     * Adds a new request to the project.
     *
     * @param state The project object.
     * @param action
     */
    addNewRequest(state, action: PayloadAction<{id: string; request: Request, folderId: string}>) {
      const {id, request, folderId} = action.payload;
      const folder = state.folders?.[folderId];

      // Edge case that the folder doesn't exist.
      if (!folder) {
        return;
      }

      // Add the request to the project
      if (!state.requests) {
        state.requests = {};
      }
      state.requests[id] = request;

      // Add the request to the folder
      if (!Array.isArray(folder.requests)) {
        folder.requests = [];
      }

      if (!folder.requests.includes(id)) {
        folder.requests.push(id);
      }
    },

    /**
     * Deletes a folder.
     *
     * @param state The project object.
     * @param action The payload:
     *  - id: the id of the folder.
     *  - parentId: the id of the containing folder.
     */
    deleteFolder(state, action: PayloadAction<{id: string, parentId: string}>) {
      const {id, parentId} = action.payload;

      if (state.requests && typeof state.requests === 'object') {
        const ids = new Set(getDescendantRequestIds(state, id));
        state.requests = Object.fromEntries(Object.entries(state.requests).filter(e => !ids.has(e[0])))
      }

      if (state.folders && typeof state.folders === 'object') {
        const ids = new Set(getDescendantFolderIds(state, id));
        state.folders = Object.fromEntries(Object.entries(state.folders).filter(e => !ids.has(e[0])))
      }

      const parent = state.folders?.[parentId];

      if (parent && Array.isArray(parent.folders)) {
        parent.folders = parent.folders.filter(i => i !== id);
      }
    },

    /**
     * Deletes a request.
     *
     * @param state The project object.
     * @param action The payload:
     *  - id: the id of the request.
     *  - parentId: the id of the containing folder.
     */
    deleteRequest(state, action: PayloadAction<{id: string, parentId: string}>) {
      const {id, parentId} = action.payload;
      delete state.requests[id];

      const folder = state.folders?.[parentId];

      if (Array.isArray(folder.requests)) {
        folder.requests = folder.requests.filter(requestId => requestId !== id);
      }
    },
  },
});

export default projectSlice.reducer
