import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { Workspace } from 'types/workspace';
import { set } from 'lodash';
import { AwsSigv4Auth } from 'types/auth';
import { Request } from 'types/request';

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
  },
});

export default workspaceSlice.reducer
