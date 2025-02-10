import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import getDescendantFolderIds from 'renderer/utils/get-descendant-folder-ids';
import getDescendantRequestIds from 'renderer/utils/get-descendant-request-ids';
import * as Persistence from 'renderer/utils/persistence';
import { Project } from 'types/project';
import { Request } from 'types/request';

const initialState: Project = null;

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
      if (!state.requests || !action.payload.request) {
        state.requests = {};
      }

      state.requests[action.payload.id] = JSON.parse(JSON.stringify(action.payload.request));

      Persistence.setProjectDirty();
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

      Persistence.setProjectDirty();
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

      Persistence.setProjectDirty();
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

      Persistence.setProjectDirty();
    },

    /**
     * Adds a new folder to the project.
     *
     * @param state The project object.
     * @param action The payload has the following:
     * - name: Name of the new folder
     * - parentId: The id of the parent folder to which the new folder is added.
     */
    newFolder(state, action: PayloadAction<{name: string, parentId: string}>) {
      const {name, parentId} = action.payload;

      if (!state.folders || !state.folders[parentId]) {
        return;
      }

      const parent = state.folders[parentId];
      const newId = nanoid();

      state.folders[newId] = {
        name: name
      };

      if (!Array.isArray(parent.folders)) {
        parent.folders = [];
      }

      parent.folders.push(newId);

      Persistence.setProjectDirty();
    },

    /**
     * Updates an environment variable name.
     *
     * @param state The project object.
     * @param action The payload contains the environment id, variable index, and the updated
     * value.
     */
    updateVarName(state, action: PayloadAction<{id: string, index: number, value: string}>) {
      const {id, index, value} = action.payload;
      const v = state.envs?.[id]?.vars?.[index];
      if (v) {
        v.name = value;
      }

      Persistence.setProjectDirty();
    },

    /**
     * Updates an environment variable value.
     *
     * @param state The project object.
     * @param action The payload contains the environment id, variable index, and the updated
     * value.
     */
    updateVarValue(state, action: PayloadAction<{id: string, index: number, value: string}>) {
      const {id, index, value} = action.payload;
      const v = state.envs?.[id]?.vars?.[index];
      if (v) {
        v.value = value;
      }

      Persistence.setProjectDirty();
    },

    /**
     * Adds a new empty environment variable.
     *
     * @param state The project object.
     * @param action The payload contains the environment id.
     */
    addEmptyVar(state, action: PayloadAction<string>) {
      const id = action.payload;
      const env = state.envs?.[id];

      if (env) {
        if (!Array.isArray(env.vars)) {
          env.vars = [];
        }

        env.vars.push({name: '', value: ''});
      }

      Persistence.setProjectDirty();
    },

    /**
     * Updates an environment variable.
     *
     * @param state The project object.
     * @param action The payload contains the environment id, variable index.
     */
    deleteVar(state, action: PayloadAction<{id: string, index: number}>) {
      const {id, index} = action.payload;
      const env = state.envs?.[id];
      const vars = env?.vars;

      if (!Array.isArray(vars) || vars.length == 1) {
        delete env.vars;
      }
      else if (index >= 0 && index < vars.length) {
        vars.splice(index, 1);
      }

      Persistence.setProjectDirty();
    },
  },
});

export default projectSlice.reducer
