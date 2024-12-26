import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Workspace } from 'types/workspace';
import { set } from 'lodash';
import { AwsSigv4Auth } from 'types/auth';
import { Request } from 'types/request';
import { Header } from 'types/header';

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
    openRequest(state, action: PayloadAction<{id: string, request: Request}>) {
      // const node = action.payload;
      const openedRequests = state.openedRequests;
      const index = openedRequests ?
        openedRequests.findIndex(openedRequest => openedRequest.id === action.payload.id) : -1;

      if (index === -1) {
        if (!Array.isArray(openedRequests)) {
          state.openedRequests = [];
        }
        state.openedRequests.push({
          id: action.payload.id,
          // Deep copy
          request: JSON.parse(JSON.stringify(action.payload.request))
        });

        state.selectedRequestIndex = state.openedRequests.length - 1;
      }
      else {
        state.selectedRequestIndex = index;
      }
    },

    /**
     * Add a new opened request.
     *
     * @param state The workspace object.
     */
    newRequest(state) {
      if (!Array.isArray(state.openedRequests)) {
        state.openedRequests = [];
      }

      state.openedRequests.push({
        id: nanoid(),
        request: {
          name: 'Unnamed request',
          method: 'GET',
          url: '',
        },
        dirty: true
      });

      state.selectedRequestIndex = state.openedRequests.length - 1;
    },

    /**
     * Closes an opened request.
     *
     * @param state The workspace state.
     * @param action The action that contains the id of the request to close.
     */
    closeRequest(state, action: PayloadAction<number>) {
      const index = action.payload;

      state.openedRequests = state.openedRequests.filter((_, i) => i !== index);

      if (state.openedRequests.length === 0) {
        delete state.selectedRequestIndex;
      }
      else if (state.selectedRequestIndex === index) {
        state.selectedRequestIndex = (index === 0 ? 0 : index - 1);
      }
      else if (state.selectedRequestIndex > index) {
        state.selectedRequestIndex = state.selectedRequestIndex - 1;
      }
    },

    /**
     * Modifies the currently selected request object.
     *
     * @param state The workspace object.
     * @param action The action with payload.
     */
    updateRequest(state, action: PayloadAction<{path: string, value: any}>) {
      const openedRequest = state.openedRequests?.[state.selectedRequestIndex];
      if (openedRequest) {
        set(openedRequest, `request.${action.payload.path}`, action.payload.value);
        openedRequest.dirty = true;
      }
    },

    /**
     * Updates the dirty flag of the currently selected tab.
     *
     * @param state The workspace object.
     * @param action Payload of true or false meaning dirty or not dirty.
     */
    setDirty(state, action: PayloadAction<boolean>) {
      const openedRequest = state.openedRequests?.[state.selectedRequestIndex];
      if (openedRequest) {
        if (action.payload) {
          openedRequest.dirty = true;
        }
        else {
          delete openedRequest.dirty;
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
      const openedRequest = state.openedRequests?.[state.selectedRequestIndex];
      const request = openedRequest?.request;

      if (!request) {
        return;
      }

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

      openedRequest.dirty = true;
    },

    /**
     * Sets AWS auth credentials source type.
     *
     * @param state The workspace object.
     * @param action The action that contains the credentials source type.
     */
    // setAwsCredsSource(state, action: PayloadAction<string>) {
    //   const openedRequest = state.openedRequests?.[state.selectedRequestIndex];
    //   const request = openedRequest?.request;

    //   if (!request) {
    //     return;
    //   }

    //   switch (action.payload) {
    //     case 'aws_cli_profile':
    //       request.auth = {
    //         type: request.auth.type,
    //         source: 'aws_cli_profile',
    //         profile: 'default',
    //       } as AwsSigv4Auth;
    //       break;

    //     case 'inline':
    //       request.auth = {
    //         type: request.auth.type,
    //         source: 'inline',
    //       } as AwsSigv4Auth;
    //       break;
    //   }

    //   openedRequest.dirty = true;
    // },

    /**
     * Sets the selected request.
     *
     * @param state The workspace state
     * @param action The action that contains the selected request path (id).
     */
    setSelectedRequest(state, action: PayloadAction<string>) {
      state.selectedRequestIndex = state.openedRequests.findIndex(
        openedRequest => openedRequest.id === action.payload
      );
    },

    /**
     * Adds a new empty request header to the selected request.
     *
     * @param state The workspace object.
     */
    addEmptyHeader(state) {
      const openedRequest = state.openedRequests?.[state.selectedRequestIndex];
      const request = openedRequest.request;

      if (!request.headers) {
        request.headers = [];
      }

      request.headers.push({key: '', value: '', enabled: true});

      openedRequest.dirty = true;
    },

    /**
     * Updates header key.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated key.
     */
    updateHeaderKey(state, action: PayloadAction<{index: number, value: string}>) {
      const openedRequest = state.openedRequests[state.selectedRequestIndex];
      const request = openedRequest.request;
      request.headers[action.payload.index].key = action.payload.value;
      openedRequest.dirty = true;
    },

    /**
     * Updates header value.
     *
     * @param state The workspace object.
     * @param action An action that contains the header index and the updated value.
     */
    updateHeaderValue(state, action: PayloadAction<{index: number, value: string}>) {
      const openedRequest = state.openedRequests[state.selectedRequestIndex];
      const request = openedRequest.request;
      request.headers[action.payload.index].value = action.payload.value;
      openedRequest.dirty = true;
    },

    /**
     * Toggles a request header on or off.
     *
     * @param state The workspace object.
     * @param action An action that contains the header.
     */
    toggleHeader(state, action: PayloadAction<number>) {
      const openedRequest = state.openedRequests[state.selectedRequestIndex];
      const request = openedRequest.request;
      request.headers[action.payload].enabled = !request.headers[action.payload].enabled;
      openedRequest.dirty = true;
    },

    /**
     * Deletes a header from the currently selected request.
     *
     * @param state The workspace object.
     * @param action Contains the index of the header.
     */
    deleteHeader(state, action: PayloadAction<number>) {
      const openedRequest = state.openedRequests[state.selectedRequestIndex];
      const request = openedRequest.request;
      if (request.headers && request.headers[action.payload]) {
        request.headers.splice(action.payload, 1);
        if (request.headers.length === 0) {
          delete request.headers;
        }
        openedRequest.dirty = true;
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
