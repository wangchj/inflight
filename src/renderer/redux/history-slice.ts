import { createSlice, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { History } from 'types/history';
import { Request } from 'types/request';

/**
 * Max number of history entries.
 */
export const maxEntries = 150;

const initialState: History = {
  schemaVersion: '2.0',
  entries: {},
  ids: [],
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    /**
     * Sets the history state object.
     *
     * @param state The current state.
     * @param action The payload is the history object.
     * @returns The new history object.
     */
    setHistory(state, action: PayloadAction<History>) {
      const history = action.payload;

      state.entries = (typeof history?.entries === 'object') ? history.entries : {};
      state.ids = Array.isArray(history?.ids) ? history.ids : [];
    },

    /**
     * Adds a new history entry.
     *
     * @param state The history state object.
     * @param action The payload is the request to add.
     */
    pushRequest(state, action: PayloadAction<Request>) {
      if (!action.payload) {
        return;
      }

      const { entries, ids } = state;
      const request = action.payload;

      // The id of the new entry.
      const id = nanoid();

      // Delete existing request name.
      delete request.name;

      entries[id] = {
        timestamp: Date.now(),
        request: action.payload,
      };

      ids.push(id);

      // Trim history to max entries.
      if (ids.length > maxEntries) {
        const trim = ids.splice(0, ids.length - maxEntries);
        for (const id of trim) {
          delete entries[id];
        }
      }
    },

    /**
     * Deletes a history entry.
     *
     * @param state The history state object.
     * @param action The id of the entry to delete.
     */
    deleteEntry(state, action: PayloadAction<string>) {
      const id = action.payload;
      delete state.entries[id];
      state.ids = state.ids.filter(i => i !== id);
    },

    /**
     * Deletes a list of history entries.
     *
     * @param state The history state object.
     * @param action The list of ids to delete.
     */
    deleteGroup(state, action: PayloadAction<string[]>) {
      const ids = action.payload;

      if (!Array.isArray(ids) || ids.length === 0) {
        return;
      }

      for (const id of ids) {
        delete state.entries[id];
      }

      state.ids = state.ids.filter(i => !ids.includes(i));
    },
  },
});

export default historySlice.reducer
