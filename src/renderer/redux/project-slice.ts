import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Project } from 'types/project';
import { Request } from 'types/request';

const initialState: Project = {
  name: '',
  requests: {},
  tree: {
    name: ''
  },
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
      state.requests[action.payload.id] = action.payload.request;
    },
  },
});

export default projectSlice.reducer
