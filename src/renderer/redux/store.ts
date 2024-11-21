import { configureStore } from '@reduxjs/toolkit'
import workspaceSlice from './workspace-slice'
import projectSlice from './project-slice'

export const store = configureStore({
  reducer: {
    workspace: workspaceSlice,
    project: projectSlice,
  },
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
