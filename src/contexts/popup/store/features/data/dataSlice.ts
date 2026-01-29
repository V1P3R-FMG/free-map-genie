import { createSlice } from "@reduxjs/toolkit";
import { SaveHelper } from "@/common/storage/saves";
import { createAppAsyncThunk } from "../../typed";
import { toastr } from "react-redux-toastr";

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
    try {
      return services.backend.isLoggedIn();
    } catch (e) {
      toastr.error("Error", "Failed to fetch logged in status");
      logger.error("Failed to fetch logged in status", e);
      return false;
    }
  }
);

export const fetchPageTypeAsync = createAppAsyncThunk<PageType, void>(
  "data/fetchPageType",
  async (_, { extra: { services } }) => {
    try {
      return services.page.getPageType();
    } catch (e) {
      toastr.error("Error", "Failed to fetch page type");
      logger.error("Failed to fetch page type", e);
      return "unknown";
    }
  }
);

export const openDataManagerAsync = createAppAsyncThunk<void, void>(
  "data/openDataManager",
  async (_, { extra: { services } }) => {
    try {
      await services.background.openDataManager();
    } catch (e) {
      toastr.error("Error", "Failed to open data manager");
      logger.error("Failed to open data manager", e);
    }
  }
);

export const importFromMapgenieAccountAsync = createAppAsyncThunk<void, void>(
  "data/importFromMapgenieAccount",
  async (_, { extra: { services } }) => {
    try {
      await services.client.importFromMapgenieAccount();
      await services.background.reloadActiveTab();
      toastr.success("Success", "Imported data from Mapgenie account");
    } catch (e) {
      toastr.error("Error", "Failed to import from Mapgenie account");
      logger.error("Failed to import from Mapgenie account", e);
    }
  }
);

export const clearMapDataAsync = createAppAsyncThunk<void, void>(
  "data/clearMapData",
  async (_, { extra: { services } }) => {
    try {
      await services.client.clearMap();
      await services.background.reloadActiveTab();
      toastr.success("Success", "Map data cleared");
    } catch (e) {
      toastr.error("Error", "Failed to clear map data");
      logger.error("Failed to clear map data", e);
    }
  }
);

export const clearGameDataAsync = createAppAsyncThunk<void, void>(
  "data/clearGameData",
  async (_, { extra: { services } }) => {
    try {
      await services.client.clearGame();
      await services.background.reloadActiveTab();
      toastr.success("Success", "Game data cleared");
    } catch (e) {
      toastr.error("Error", "Failed to clear game data");
      logger.error("Failed to clear game data", e);
    }
  }
);

export const exportUserDataAsync = createAppAsyncThunk<void, void>(
  "data/exportUserData",
  async (_, { extra: { services } }) => {
    try {
      const { userId, games } = await services.backend.exportActiveUser();
      const file = saveHelper.write(userId, games);
      saveHelper.download(file);
      toastr.success("Success", "User data exported");
    } catch (e) {
      toastr.error("Error", "Failed to export user data");
      logger.error("Failed to export user data", e);
    }
  }
);

export const exportGameDataAsync = createAppAsyncThunk<void, void>(
  "data/exportGameData",
  async (_, { extra: { services } }) => {
    try {
      const { userId, games } = await services.client.export();
      const file = saveHelper.write(userId, games);
      saveHelper.download(file);
      toastr.success("Success", "Game data exported");
    } catch (e) {
      toastr.error("Error", "Failed to export game data");
      logger.error("Failed to export game data", e);
    }
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
      .addCase(fetchPageTypeAsync.fulfilled, (state, action) => {
        state.pageType = action.payload;
      })
      .addCase(importFromMapgenieAccountAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(importFromMapgenieAccountAsync.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(clearMapDataAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(clearMapDataAsync.fulfilled, (state) => {
        state.busy = false;
      })
      .addCase(clearGameDataAsync.pending, (state) => {
        state.busy = true;
      })
      .addCase(clearGameDataAsync.fulfilled, (state) => {
        state.busy = false;
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
