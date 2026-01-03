import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { set } from 'lodash';
import * as Persistence from 'renderer/utils/persistence';
import { Workspace } from 'types/workspace';
import { AwsSigv4Auth, AwsSigv4CliProfileAuth, AwsSigv4InlineAuth } from 'types/auth';
import { Request } from 'types/request';
import { OpenedResource } from 'types/opened-resource';
import { OpenedRequest } from 'types/opened-request';

const initialState: Workspace = {
  schemaVersion: '1.0',
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    /**
     * Resets the workspace to initial state.
     *
     * @param state The state model object.
     * @param action The payload is the project path.
     */
    openProject(state, action: PayloadAction<string>) {
      const projectPath = action.payload;
      Persistence.saveWorkspaceDelay();
      return {
        ...initialState,
        projectPath
      };
    },

    /**
     * Close the currently opened project.
     *
     * @param state The state model object.
     */
    closeProject(state) {
      delete state.projectPath;
      Persistence.saveWorkspaceDelay();
    },

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
     * Adds a request to opened resources.
     *
     * @param state The workspace object.
     * @param action The action object.
     */
    openRequest(state, action: PayloadAction<{id: string, folderId: string, request: Request}>) {
      const {id, folderId, request} = action.payload;

      if (!id || !request) {
        return;
      }

      const index = state.openedResources?.findIndex(openedResource => openedResource.id === id);

      if (index >= 0) {
        state.selectedResourceIndex = index;
      }
      else {
        if (!Array.isArray(state.openedResources)) {
          state.openedResources = [];
        }
        state.openedResources.push({
          id: id,
          type: 'request',
          props: {
            folderId,
            request: JSON.parse(JSON.stringify(request)) // Deep copy
          } as OpenedRequest
        });

        state.selectedResourceIndex = state.openedResources.length - 1;
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Adds an environment to opened resource list.
     *
     * @param state The workspace object.
     * @param action The action object.
     */
    openEnv(state, action: PayloadAction<{id: string}>) {
      const {id} = action.payload;

      if (!id) {
        return;
      }

      const index = state.openedResources?.findIndex(openedResource => openedResource.id === id);

      if (index >= 0) {
        state.selectedResourceIndex = index;
      }
      else {
        if (!Array.isArray(state.openedResources)) {
          state.openedResources = [];
        }

        state.openedResources.push({
          id,
          type: 'env'
        });

        state.selectedResourceIndex = state.openedResources.length - 1;
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Adds a new request to open resources list.
     *
     * @param state The workspace object.
     */
    newRequest(state) {
      if (!Array.isArray(state.openedResources)) {
        state.openedResources = [];
      }

      state.openedResources.push({
        id: nanoid(),
        type: 'request',
        props: {
          request: {
            method: 'GET',
            url: '',
          }
        } as OpenedRequest,
        dirty: true
      });

      state.selectedResourceIndex = state.openedResources.length - 1;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Closes an opened resource.
     *
     * @param state The workspace state.
     * @param action The action that contains the id of the resource to close.
     */
    closeResource(state, action: PayloadAction<number | string>) {
      const payload = action.payload;
      const index = payload === undefined ? state.selectedResourceIndex :
        typeof payload === 'number' ? payload :
        state.openedResources?.findIndex(r => r.id === payload);

      if (!Array.isArray(state.openedResources) ||
          index < 0 ||
          index > state.openedResources.length - 1)
      {
        return;
      }

      state.openedResources = state.openedResources.filter((_, i) => i !== index);

      if (state.openedResources.length === 0) {
        delete state.selectedResourceIndex;
      }
      else if (state.selectedResourceIndex === index) {
        state.selectedResourceIndex = (index === 0 ? 0 : index - 1);
      }
      else if (state.selectedResourceIndex > index) {
        state.selectedResourceIndex = state.selectedResourceIndex - 1;
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Modifies the currently selected request object. If the currently selected resource is not
     * a request, then no action is performed. This function unsets the property if the value is an
     * empty string.
     *
     * @param state The workspace object.
     * @param action The action with payload.
     */
    updateRequest(state, action: PayloadAction<{path: string, value: any}>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (openedResource && openedResource.type === 'request') {
        const value = action.payload.value;
        const path = `props.request.${action.payload.path}`;
        set(openedResource, path, (typeof value !== 'string' || value) ? value : undefined);
        openedResource.dirty = true;
        Persistence.saveWorkspaceDelay();
      }
    },

    /**
     * Sets the selected opened resource object.
     *
     * @param state The workspace object.
     * @param action The payload is the object to use.
     */
    setResource(state, action: PayloadAction<OpenedResource>) {
      const index = state.selectedResourceIndex;
      const openedResources = state.openedResources;

      if (!Array.isArray(openedResources) || typeof index !== 'number' || index < 0 ||
        index > openedResources.length - 1)
      {
        return;
      }

      openedResources[index] = action.payload;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Updates the dirty flag of the currently selected tab.
     *
     * @param state The workspace object.
     * @param action Payload of true or false meaning dirty or not dirty.
     */
    setDirty(state, action: PayloadAction<boolean>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];
      if (openedResource) {
        if (action.payload) {
          openedResource.dirty = true;
        }
        else {
          delete openedResource.dirty;
        }
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Sets auth type of selected request object.
     *
     * @param state The workspace object.
     * @param action The action that contains the updated auth type.
     */
    setAuthType(state, action: PayloadAction<string>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;

      switch (action.payload) {
        case 'aws_sigv4':
          request.auth = {
            type: action.payload,
            source: 'aws_cli_profile',
            profile: 'default',
          } as AwsSigv4Auth;
          break;

        default:
          delete request.auth;
      }

      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Sets the AWS auth credentials source of the selected request object.
     *
     * @param state The workspace object.
     * @param action The credentials source type.
     */
    setAwsCredsSource(state, action: PayloadAction<string>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;
      const auth = request.auth as AwsSigv4Auth;

      switch (action.payload) {
        case 'aws_cli_profile':
          request.auth = {
            type: 'aws_sigv4',
            source: 'aws_cli_profile',
            profile: 'default',
            region: auth?.region,
            service: auth?.service,
          } as AwsSigv4CliProfileAuth;
          break;

        case 'inline':
          request.auth = {
            type: 'aws_sigv4',
            source: 'inline',
            region: auth?.region,
            service: auth?.service,
          } as AwsSigv4InlineAuth;
          break;
      }

      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Sets the selected tab.
     *
     * @param state The workspace state
     * @param action The payload is either the index or resource id.
     */
    setSelectedTab(state, action: PayloadAction<number | string>) {
      const payload = action.payload;
      const openedResources = state.openedResources;
      const index = typeof payload === 'number' ? payload : openedResources?.findIndex(
        item => item.id === payload
      ) ?? -1;

      if (index < 0 || index > openedResources?.length || index === state.selectedResourceIndex) {
        return;
      }

      state.selectedResourceIndex = index;
      Persistence.saveWorkspaceDelay();
    },

    /**
     * Adds a new empty request header to the selected request.
     *
     * @param state The workspace object.
     */
    addEmptyHeader(state) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;

      if (!request.headers) {
        request.headers = [];
      }

      request.headers.push({key: '', value: '', enabled: true});

      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Updates header key.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated key.
     */
    updateHeaderKey(state, action: PayloadAction<{index: number, value: string}>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;
      request.headers[action.payload.index].key = action.payload.value;
      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Updates header value.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated value.
     */
    updateHeaderValue(state, action: PayloadAction<{index: number, value: string}>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;
      request.headers[action.payload.index].value = action.payload.value;
      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Toggles a request header on or off.
     *
     * @param state The workspace object.
     * @param action An action that contains the header.
     */
    toggleHeader(state, action: PayloadAction<number>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;
      request.headers[action.payload].enabled = !request.headers[action.payload].enabled;
      openedResource.dirty = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Deletes a header from the currently selected request.
     *
     * @param state The workspace object.
     * @param action Contains the index of the header.
     */
    deleteHeader(state, action: PayloadAction<number>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource?.props?.request || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.props.request;
      if (request.headers && request.headers[action.payload]) {
        request.headers.splice(action.payload, 1);
        if (request.headers.length === 0) {
          delete request.headers;
        }
        openedResource.dirty = true;
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Expands a tree folder node.
     *
     * @param state The workspace object.
     * @param action Contains the id of the folder to expand.
     */
    expandTreeNode(state, action: PayloadAction<string>) {
      if (!state.treeExpandedState) {
        state.treeExpandedState = {};
      }

      state.treeExpandedState[action.payload] = true;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Collapses a tree folder node.
     *
     * @param state The workspace object.
     * @param action Contains the id of the folder to collapse.
     */
    collapseTreeNode(state, action: PayloadAction<string>) {
      if (!state.treeExpandedState) {
        state.treeExpandedState = {};
      }

      state.treeExpandedState[action.payload] = false;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Sets selected environment of an environment group.
     *
     * @param state The workspace object.
     * @param action The payload contains the group id and environment id.
     */
    selectEnv(state, action: PayloadAction<{groupId: string, envId?: string}>) {
      const {groupId, envId} = action.payload;

      if (!groupId) {
        return;
      }

      if (envId) {
        if (!state.selectedEnvs) {
          state.selectedEnvs = {};
        }
        state.selectedEnvs[groupId] = envId;
      }
      else {
        if (state.selectedEnvs) {
          delete state.selectedEnvs[groupId];

          if (Object.keys(state.selectedEnvs).length === 0) {
            delete state.selectedEnvs;
          }
        }
      }

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Reorders/moves an opened resource tab.
     *
     * @param state
     * @param action
     */
    reorderResource(state, action: PayloadAction<{fromIndex: number, toIndex: number}>) {
      const {fromIndex, toIndex} = action.payload;
      const openedResources = state.openedResources ?? [];

      if (fromIndex === toIndex ||
          fromIndex < 0 || fromIndex > openedResources.length - 1 ||
          toIndex < 0 || toIndex > openedResources.length - 1)
      {
        return;
      }

      // Delete the item from the previous position
      const res = state.openedResources.splice(fromIndex, 1);

      // Insert the item into the new position
      state.openedResources.splice(toIndex, 0, res[0]);

      // Adjust selectedIndex
      state.selectedResourceIndex = toIndex;

      Persistence.saveWorkspaceDelay();
    },

    /**
     * Rename an opened resource.
     *
     * @param state The workspace model draft.
     * @param action The payload contains the id and new name of the resource.
     */
    renameResource(state, action: PayloadAction<{id: string, name: string}>) {
      const {id, name} = action.payload;
      const res = state.openedResources?.find(r => r.id === id);

      if (!res || !name || res.type !== 'request') {
        return;
      }

      res.props.request.name = name;

      Persistence.saveWorkspaceDelay();
    },
  },
});

export default workspaceSlice.reducer
