import { createSlice } from "@reduxjs/toolkit";
import { SaveHelper } from "@/common/storage/saves";
import { createAppAsyncThunk } from "../../typed";

import type { PageType } from "@/common/mapgenie";

const saveHelper = new SaveHelper();

export interface DataState {
  busy: boolean;
  loggedIn: boolean;
  pageType: PageType;
}

const initialState: DataState = {
  busy: false,
  loggedIn: false,
  pageType: "unknown",
};

export const fetchLoggedInStatusAsync = createAppAsyncThunk<boolean, void>(
  "data/fetchLoggedInStatus",
  async (_, { extra: { services } }) => {
    return services.backend.isLoggedIn();
  }
);

export const fetchPageTypeAsync = createAppAsyncThunk<PageType, void>(
  "data/fetchPageType",
  async (_, { extra: { services } }) => {
    return services.page.getPageType();
  }
);

export const openDataManagerAsync = createAppAsyncThunk<void, void>(
  "data/openDataManager",
  async (_, { extra: { services } }) => {
    await services.background.openDataManager();
  }
);

export const importFromMapgenieAccountAsync = createAppAsyncThunk<void, void>(
  "data/importFromMapgenieAccount",
  async (_, { extra: { services } }) => {
    await services.client.importFromMapgenieAccount();
    await services.background.reloadActiveTab();
  }
);

export const clearMapDataAsync = createAppAsyncThunk<void, void>(
  "data/clearMapData",
  async (_, { extra: { services } }) => {
    await services.client.clearMap();
    await services.background.reloadActiveTab();
  }
);

export const clearGameDataAsync = createAppAsyncThunk<void, void>(
  "data/clearGameData",
  async (_, { extra: { services } }) => {
    await services.client.clearGame();
    await services.background.reloadActiveTab();
  }
);

export const exportUserDataAsync = createAppAsyncThunk<void, void>(
  "data/exportUserData",
  async (_, { extra: { services } }) => {
    const { userId, games } = await services.backend.exportActiveUser();
    const file = saveHelper.write(userId, games);
    saveHelper.download(file);
  }
);

export const exportGameDataAsync = createAppAsyncThunk<void, void>(
  "data/exportGameData",
  async (_, { extra: { services } }) => {
    const { userId, games } = await services.client.export();
    const file = saveHelper.write(userId, games);
    saveHelper.download(file);
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
  selectors: {
    isBusy: (state) => state.busy,
    isLoggedIn: (state) => state.loggedIn,
    getPageType: (state) => state.pageType,
  },
});

export const {} = infoSlice.actions;

export const { isBusy, isLoggedIn, getPageType } = infoSlice.selectors;

export default infoSlice.reducer;
