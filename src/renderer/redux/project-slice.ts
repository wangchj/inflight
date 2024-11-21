import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Project } from 'types/project';

const initialState: Project = {
  name: '',
  items: []
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProject(state, action: PayloadAction<Project>) {
      return action.payload;
    }
  },
});

export default projectSlice.reducer
