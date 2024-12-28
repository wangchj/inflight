import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
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
  },
});

export default projectSlice.reducer
