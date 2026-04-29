import { createSlice, nanoid } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { History } from 'types/history';
import { Request } from 'types/request';

/**
 * Max number of history entries.
 */
export const maxEntries = 150;

/**
 * The number of allowed overflow entries before the number of entries is reduced to max entries.
 */
export const overflow = 50;

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

      // if (typeof history?.entries !== 'object' || !Array.isArray(history?.ids)) {
      //   return;
      // }

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

      // If overflow is full, clear the overflow.
      if (ids.length >= maxEntries + overflow) {
        const tail = ids.splice(0, 50);
        for (const id of tail) {
          delete entries[id];
        }
      }

      // The id of the new entry;
      const id = nanoid();

      entries[id] = {
        timestamp: Date.now(),
        request: action.payload,
      };

      ids.push(id);
    },
  },
});

export default historySlice.reducer
