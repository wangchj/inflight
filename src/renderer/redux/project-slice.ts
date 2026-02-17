import { Operation } from '@atlaskit/pragmatic-drag-and-drop-hitbox/dist/types/list-item';
import { TreeNodeData } from '@mantine/core/lib';
import { createSlice, nanoid } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import getDescendantFolderIds from 'renderer/utils/get-descendant-folder-ids';
import getDescendantRequestIds from 'renderer/utils/get-descendant-request-ids';
import * as Persistence from 'renderer/utils/persistence';
import validTreeMove from 'renderer/utils/valid-tree-move';
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
     * Close the currently opened project.
     */
    closeProject() {
      return null;
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

      Persistence.saveProjectDelay();
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

      Persistence.saveProjectDelay();
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

      Persistence.saveProjectDelay();
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

      Persistence.saveProjectDelay();
    },

    /**
     * Duplicates a request.
     *
     * @param state The project object.
     * @param action The the payload contains
     *  - The id of the original request
     *  - The id of the parent folder
     *  - The name of the new request
     */
    duplicateRequest(state, action: PayloadAction<{id: string, parentId: string, name: string}>) {
      const {id, parentId, name} = action.payload;
      const folder = state.folders?.[parentId];
      const request = state.requests?.[id];

      if (!folder || !request || !folder.requests) {
        return;
      }

      const newId = nanoid();
      const duplicate = JSON.parse(JSON.stringify(request));
      duplicate.name = name;
      state.requests[newId] = duplicate;
      folder.requests.push(newId);

      Persistence.saveProjectDelay();
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

      Persistence.saveProjectDelay();
    },

    /**
     * Adds a new dimension to the project.
     *
     * @param state The project object.
     * @param action Contains new dimension name.
     */
    newDimension(state, action: PayloadAction<{name: string}>) {
      let {name} = action.payload;

      // Create dimension structure if not exist.
      if (!state.dimensions) {
        state.dimensions = {};
      }

      // Create the new dimension.
      const dimensionId = nanoid();
      state.dimensions[dimensionId] = {name: name};

      // Create order array if not already exist
      if (!Array.isArray(state.dimOrder)) {
        state.dimOrder = [];
      }

      // Add the new dimension to the order array
      state.dimOrder.push(dimensionId);

      Persistence.saveProjectDelay();
    },

    /**
     * Adds a new variant to the project.
     *
     * @param state The project object.
     * @param action The payload contains parameters for the new variant.
     */
    newVariant(state, action: PayloadAction<{id: string, name: string, parentId?: string}>) {
      const {id, name, parentId} = action.payload;
      const dim = state.dimensions?.[parentId];

      if (!dim || !name) {
        return;
      }

      if (!state.variants || typeof state.variants !== 'object') {
        state.variants = {};
      }

      state.variants[id] = {name}

      if (!dim.variants) {
        dim.variants = [];
      }

      dim.variants.push(id);

      Persistence.saveProjectDelay();
    },

    /**
     * Updates a variant variable name.
     *
     * @param state The project object.
     * @param action The payload contains the variant id, variable index, and the updated value.
     */
    updateVarName(state, action: PayloadAction<{id: string, index: number, value: string}>) {
      const {id, index, value} = action.payload;
      const v = state.variants?.[id]?.vars?.[index];
      if (v) {
        v.name = value;
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Updates a variant variable value.
     *
     * @param state The project object.
     * @param action The payload contains the variant id, variable index, and the updated value.
     */
    updateVarValue(state, action: PayloadAction<{id: string, index: number, value: string}>) {
      const {id, index, value} = action.payload;
      const v = state.variants?.[id]?.vars?.[index];
      if (v) {
        v.value = value;
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Adds a new empty variant variable.
     *
     * @param state The project object.
     * @param action The payload contains the variant id.
     */
    addEmptyVar(state, action: PayloadAction<string>) {
      const id = action.payload;
      const variant = state.variants?.[id];

      if (variant) {
        if (!Array.isArray(variant.vars)) {
          variant.vars = [];
        }

        variant.vars.push({name: '', value: ''});
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Deletes a variant variable.
     *
     * @param state The project object.
     * @param action The payload contains the variant id, variable index.
     */
    deleteVar(state, action: PayloadAction<{id: string, index: number}>) {
      const {id, index} = action.payload;
      const variant = state.variants?.[id];
      const vars = variant?.vars;

      if (!Array.isArray(vars) || vars.length == 1) {
        delete variant.vars;
      }
      else if (index >= 0 && index < vars.length) {
        vars.splice(index, 1);
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Deletes a dimension.
     *
     * @param state The project object.
     * @param action The payload contains the dimension id.
     */
    deleteDimension(state, action: PayloadAction<{dimId: string}>) {
      const {dimId} = action.payload;
      const dim = state.dimensions[dimId];

      if (!dim) {
        return;
      }

      // Delete variants of the dimension
      for (const id of dim.variants ?? []) {
        delete state.variants?.[id];
      }

      // Delete the dimension
      delete state.dimensions[dimId];

      // Delete the dimension from order array
      if (Array.isArray(state.dimOrder)) {
        state.dimOrder = state.dimOrder.filter(id => id !== dimId);
      }

      // Clean up the project dimensions if there are no more dimensions
      if (Object.keys(state.dimensions).length === 0) {
        delete state.dimensions;
        delete state.variants;
        delete state.dimOrder;
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Deletes a variant.
     *
     * @param state The project object.
     * @param action The payload contains the variant id and dimension id.
     */
    deleteVariant(state, action: PayloadAction<{id: string, dimId: string}>) {
      const {id, dimId } = action.payload;

      if (!state.variants?.[id]) {
        return;
      }

      delete state.variants[id];

      const dim = state.dimensions[dimId];

      if (dim && Array.isArray(dim.variants)) {
        dim.variants = dim.variants.filter(i => i !== id);
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Duplicates a variant.
     *
     * @param state The project object.
     * @param action The the payload contains
     *  - The id of the original variant
     *  - The id of the parent dimension
     *  - The name of the new variant
     */
    duplicateVariant(state, action: PayloadAction<{id: string, dimId: string, name: string}>) {
      const {id, dimId, name} = action.payload;
      const dim = state.dimensions?.[dimId];
      const variant = state.variants?.[id];

      if (!dim || !variant) {
        return;
      }

      const newId = nanoid();
      const duplicate = JSON.parse(JSON.stringify(variant));
      duplicate.name = name;
      state.variants[newId] = duplicate;
      dim.variants.push(newId);

      Persistence.saveProjectDelay();
    },

    /**
     * Renames a resource.
     *
     * @param state The project model draft.
     * @param action The payload contains the type and id of the resource and the new name.
     */
    renameResource(state, action: PayloadAction<{id: string, type: string, name: string}>) {
      const {id, type, name} = action.payload;
      const res = {
        folder:    state.folders?.[id],
        request:   state.requests?.[id],
        dimension: state.dimensions?.[id],
        variant:   state.variants?.[id],
      }[type];

      if (!res || !name) {
        return;
      }

      res.name = name;

      Persistence.saveProjectDelay();
    },

    /**
     * Renames the project.
     *
     * @param state The project model draft.
     * @param action The payload is the new name.
     */
    renameProject(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },

    /**
     * Moves a request or folder node in the project tree.
     *
     * @param state The project object.
     * @param action The payload contains:
     *   - `drag`: the node that is being dragged (moved).
     *   - `drop`: the node on which the dragged node is dropped.
     *   - `op`: the drop operation.
     */
    moveTreeNode(state,
      action: PayloadAction<{drag: TreeNodeData, drop: TreeNodeData, op: Operation}>
    ) {
      const {drag, drop, op} = action.payload;

      if (!validTreeMove(state, drag, drop)) {
        return;
      }

      const dragId = drag.value;
      const dropId = drop.value;
      const dragPid = drag.nodeProps.parentId;
      const dropPid = drop.nodeProps.parentId;
      const dragType = drag.nodeProps.type;
      const dropType = drop.nodeProps.type;

      // Take the node out of the original location
      const dragParent = state.folders[dragPid];
      const index = dragType === 'folder' ? dragParent?.folders?.indexOf(dragId) :
        dragParent?.requests?.indexOf(dragId);

      if (index === undefined || index < 0) {
        return;
      }

      dragType === 'folder' ? dragParent.folders.splice(index, 1)[0] :
        dragParent.requests.splice(index, 1)[0];

      // Insert the node into the new location in the tree
      const dropParent = state.folders[dropPid];

      if (dragType === 'folder' && !Array.isArray(dropParent.folders)) {
        dropParent.folders = [];
      }

      if (dragType === 'request' && !Array.isArray(dropParent.requests)) {
        dropParent.requests = [];
      }

      if (dragType === 'request' && dropType === 'request') {
        const index = dropParent.requests.indexOf(dropId);
        index < 0 ? dropParent.requests.push(dragId) :
          dropParent.requests.splice(op === 'reorder-before'  ? index : index + 1, 0, dragId);
      }
      else if (dragType === 'request' && dropType === 'folder') {
        if (op === 'combine') {
          const dropFolder = state.folders[dropId];
          dropFolder.requests = [...dropFolder.requests ?? [], dragId];
        }
        else {
          dropParent.requests.unshift(dragId);
        }
      }
      else if (dragType === 'folder' && dropType == 'request') {
        dropParent.folders.push(dragId);
      }
      else {
        if (op === 'combine') {
          const dropFolder = state.folders[dropId];
          dropFolder.folders = [...dropFolder.folders ?? [], dragId];
        }
        else {
          const index = dropParent.folders.indexOf(dropId);
          index < 0 ? dropParent.folders.push(dragId) :
            dropParent.folders.splice(op === 'reorder-before' ? index : index + 1, 0, dragId);
        }
      }

      Persistence.saveProjectDelay();
    },

    /**
     * Moves (reorder) a dimension node in the tree.
     *
     * @param state The project object.
     * @param action The payload contains:
     *   - `drag`: the node that is being dragged (moved).
     *   - `drop`: the node on which the dragged node is dropped.
     *   - `op`: the drop operation.
     */
    moveDimensionNode(state,
      action: PayloadAction<{drag: TreeNodeData, drop: TreeNodeData, op: Operation}>)
    {
      const {drag, drop, op} = action.payload;

      if (!validTreeMove(state, drag, drop)) {
        return;
      }

      const dragIndex = state.dimOrder.indexOf(drag.value);
      const dropIndex = state.dimOrder.indexOf(drop.value);

      state.dimOrder.splice(dragIndex, 1);
      state.dimOrder.splice(op === 'reorder-before' ? dropIndex : dropIndex + 1, 0, drag.value);

      Persistence.saveProjectDelay();
    },

    /**
     * Moves (reorder) a variant node in the tree.
     *
     * @param state The project object.
     * @param action The payload contains:
     *   - `drag`: the node that is being dragged (moved).
     *   - `drop`: the node on which the dragged node is dropped.
     *   - `op`: the drop operation.
     */
    moveVariantNode(state,
      action: PayloadAction<{drag: TreeNodeData, drop: TreeNodeData, op: Operation}>)
    {
      const {drag, drop, op} = action.payload;

      if (!validTreeMove(state, drag, drop)) {
        return;
      }

      const parentId = drag.nodeProps.parentId;
      const dimension = state.dimensions[parentId];

      if (!dimension || !Array.isArray(dimension.variants)) {
        return;
      }

      const dragIndex = dimension.variants.indexOf(drag.value);
      const dropIndex = dimension.variants.indexOf(drop.value);

      if (dragIndex < 0 || dropIndex < 0) {
        return;
      }

      dimension.variants.splice(dragIndex, 1);
      dimension.variants.splice(op === 'reorder-before' ? dropIndex : dropIndex + 1, 0, drag.value);

      Persistence.saveProjectDelay();
    },
  }
});

export default projectSlice.reducer
