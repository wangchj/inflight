import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Workspace } from 'types/workspace';
import { set } from 'lodash';
import { AwsSigv4Auth } from 'types/auth';
import { Request } from 'types/request';
import { OpenedResource } from 'types/opened-resource';
import { OpenedResourceModel } from 'types/opened-resource-model';
import { OpenedResourceType } from 'types/opened-resource-type';

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
     * Adds a resource to opened resource list.
     *
     * @param state The workspace object.
     * @param action The action object.
     */
    openResource(
      state,
      action: PayloadAction<{
        id: string,
        parentId: string,
        type: OpenedResourceType,
        model: OpenedResourceModel
      }>
    ) {
      const openedResources = state.openedResources;
      const index = openedResources ?
        openedResources.findIndex(openedResource => openedResource.id === action.payload.id) : -1;

      if (index === -1) {
        if (!Array.isArray(openedResources)) {
          state.openedResources = [];
        }
        state.openedResources.push({
          id: action.payload.id,
          parentId: action.payload.parentId,
          type: action.payload.type,
          // Deep copy
          model: JSON.parse(JSON.stringify(action.payload.model))
        });

        state.selectedResourceIndex = state.openedResources.length - 1;
      }
      else {
        state.selectedResourceIndex = index;
      }
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
        model: {
          method: 'GET',
          url: '',
        },
        dirty: true
      });

      state.selectedResourceIndex = state.openedResources.length - 1;
    },

    /**
     * Closes an opened resource.
     *
     * @param state The workspace state.
     * @param action The action that contains the id of the resource to close.
     */
    closeResource(state, action: PayloadAction<number | string>) {
      const index = typeof action.payload === 'number' ? action.payload :
        state.openedResources?.findIndex(r => r.id === action.payload);

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
    },

    /**
     * Modifies the currently selected resource object.
     *
     * @param state The workspace object.
     * @param action The action with payload.
     */
    updateResource(state, action: PayloadAction<{path: string, value: any}>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];
      if (openedResource) {
        set(openedResource, `model.${action.payload.path}`, action.payload.value);
        openedResource.dirty = true;
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
    },

    /**
     * Sets auth type of selected request object.
     *
     * @param state The workspace object.
     * @param action The action that contains the updated auth type.
     */
    setAuthType(state, action: PayloadAction<string>) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;

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
    },

    /**
     * Sets the selected tab.
     *
     * @param state The workspace state
     * @param action The action that contains the selected request path (id).
     */
    setSelectedTab(state, action: PayloadAction<string>) {
      state.selectedResourceIndex = state.openedResources.findIndex(
        openedTab => openedTab.id === action.payload
      );
    },

    /**
     * Adds a new empty request header to the selected request.
     *
     * @param state The workspace object.
     */
    addEmptyHeader(state) {
      const openedResource = state.openedResources?.[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;

      if (!request.headers) {
        request.headers = [];
      }

      request.headers.push({key: '', value: '', enabled: true});

      openedResource.dirty = true;
    },

    /**
     * Updates header key.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated key.
     */
    updateHeaderKey(state, action: PayloadAction<{index: number, value: string}>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;
      request.headers[action.payload.index].key = action.payload.value;
      openedResource.dirty = true;
    },

    /**
     * Updates header value.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated value.
     */
    updateHeaderValue(state, action: PayloadAction<{index: number, value: string}>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;
      request.headers[action.payload.index].value = action.payload.value;
      openedResource.dirty = true;
    },

    /**
     * Toggles a request header on or off.
     *
     * @param state The workspace object.
     * @param action An action that contains the header.
     */
    toggleHeader(state, action: PayloadAction<number>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;
      request.headers[action.payload].enabled = !request.headers[action.payload].enabled;
      openedResource.dirty = true;
    },

    /**
     * Deletes a header from the currently selected request.
     *
     * @param state The workspace object.
     * @param action Contains the index of the header.
     */
    deleteHeader(state, action: PayloadAction<number>) {
      const openedResource = state.openedResources[state.selectedResourceIndex];

      if (!openedResource || !openedResource.model || openedResource.type !== 'request') {
        return;
      }

      const request = openedResource.model as Request;
      if (request.headers && request.headers[action.payload]) {
        request.headers.splice(action.payload, 1);
        if (request.headers.length === 0) {
          delete request.headers;
        }
        openedResource.dirty = true;
      }
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
    },
  },
});

export default workspaceSlice.reducer
