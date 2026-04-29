import { configureStore } from '@reduxjs/toolkit';
import historySlice from './history-slice';
import workspaceSlice from './workspace-slice';
import projectSlice from './project-slice';
import resultsSlice from './results-slice';
import uiSlice from './ui-slice';

export const store = configureStore({
  reducer: {
    workspace: workspaceSlice,
    project: projectSlice,
    results: resultsSlice,
    history: historySlice,
    ui: uiSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const dispatch = store.dispatch;
