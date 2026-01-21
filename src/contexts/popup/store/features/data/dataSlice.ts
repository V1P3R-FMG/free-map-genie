import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "@/contexts/popup/store";
import type { PageType } from "@/common/mapgenie";

export interface InfoState {
  busy: boolean;
  loggedIn: boolean;
  pageType: PageType;
}

const initialState: InfoState = {
  busy: false,
  loggedIn: false,
  pageType: "unknown",
};

export const fetchLoggedInStatusAsync = createAsyncThunk<boolean, void>(
  "data/fetchLoggedInStatus",
  async (_, { getState }) => {
    const state = getState() as RootState;
    return state.services.backend.isLoggedIn();
  }
);

export const fetchPageTypeAsync = createAsyncThunk<PageType, void>(
  "data/fetchPageType",
  async (_, { getState }) => {
    const state = getState() as RootState;
    return state.services.page.getPageType();
  }
);

export const openDataManagerAsync = createAsyncThunk<void, void>(
  "data/openDataManager",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.background.openDataManager();
  }
);

export const importFromMapgenieAccountAsync = createAsyncThunk<void, void>(
  "data/importFromMapgenieAccount",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.client.importFromMapgenieAccount();
    await state.services.background.reloadActiveTab();
  }
);

export const clearMapDataAsync = createAsyncThunk<void, void>(
  "data/clearMapData",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.client.clearMap();
    await state.services.background.reloadActiveTab();
  }
);

export const clearGameDataAsync = createAsyncThunk<void, void>(
  "data/clearGameData",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.client.clearGame();
    await state.services.background.reloadActiveTab();
  }
);

export const infoSlice = createSlice({
  name: "data",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLoggedInStatusAsync.fulfilled, (state, action) => {
        state.loggedIn = action.payload;
      })
      .addCase(fetchLoggedInStatusAsync.rejected, (state) => {
        logger.error("Failed to fetch logged in status for data slice");
      })
      .addCase(fetchPageTypeAsync.fulfilled, (state, action) => {
        state.pageType = action.payload;
      })
      .addCase(fetchPageTypeAsync.rejected, (state) => {
        logger.error("Failed to fetch page type for data slice");
      })
      .addCase(openDataManagerAsync.rejected, (state) => {
        logger.error("Failed to open data manager");
      })
      .addCase(importFromMapgenieAccountAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(importFromMapgenieAccountAsync.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(importFromMapgenieAccountAsync.rejected, (state) => {
        logger.error("Failed to import from Mapgenie account");
      })
      .addCase(clearMapDataAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(clearMapDataAsync.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(clearMapDataAsync.rejected, (state) => {
        logger.error("Failed to clear map data");
      })
      .addCase(clearGameDataAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(clearGameDataAsync.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(clearGameDataAsync.rejected, (state) => {
        logger.error("Failed to clear game data");
      });
  },
});

export const {} = infoSlice.actions;

export const isBusy = (state: RootState) => state.data.busy;
export const isLoggedIn = (state: RootState) => state.data.loggedIn;
export const getPageType = (state: RootState) => state.data.pageType;

export default infoSlice.reducer;
