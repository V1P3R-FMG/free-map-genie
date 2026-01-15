import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { compareVersions, displayVersion } from "@/common/version";

import type { RootState } from "@/contexts/popup/store";

export interface AppState {
  version: string;
  latest: string;
  displayVersion: string;
  isDevBuild: boolean;
  needsUpdate: boolean;
  author: string;
  homepage: string;
  connected: boolean;
}

const initialState: AppState = {
  version: import.meta.env.PKG_VERSION,
  latest: import.meta.env.PKG_VERSION,
  displayVersion: displayVersion(
    import.meta.env.PKG_VERSION,
    import.meta.env.DEV
  ),
  isDevBuild: import.meta.env.DEV,
  needsUpdate: false,
  author: import.meta.env.PKG_AUTHOR,
  homepage: import.meta.env.PKG_HOMEPAGE,
  connected: false,
};

export const fetchLatestVersionAsync = createAsyncThunk<string>(
  "app/fetchLatestVersion",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const homepage = state.app.homepage;

    const url = new URL("https://raw.githubusercontent.com");
    url.pathname = new URL(homepage).pathname + "/main/package.json";

    const res = await fetch(url.toString());
    const json = await res.json();

    return json.version as string;
  }
);

export const reloadActiveTabAsync = createAsyncThunk<void>(
  "app/reloadActiveTab",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.background.reloadActiveTab();
  }
);

export const updateConnectedStatusAsync = createAsyncThunk(
  "app/fetchConnectedStatus",
  async (_, { getState }) => {
    const state = getState() as RootState;
    await state.services.page.ping();
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchLatestVersionAsync.fulfilled, (state, action) => {
      state.latest = action.payload;
      state.needsUpdate = compareVersions(state.latest, state.version) > 0;
    });
    builder.addCase(updateConnectedStatusAsync.fulfilled, (state, action) => {
      state.connected = true;
    });
    builder.addCase(updateConnectedStatusAsync.rejected, (state, action) => {
      state.connected = false;
    });
  },
});

export const {} = appSlice.actions;

export const selectAppVersion = (state: RootState) => state.app.version;
export const selectAppLatestVersion = (state: RootState) => state.app.latest;
export const selectAppDisplayVersion = (state: RootState) =>
  state.app.displayVersion;
export const selectAppIsDevBuild = (state: RootState) => state.app.isDevBuild;
export const selectAppNeedsUpdate = (state: RootState) => state.app.needsUpdate;
export const selectAppAuthor = (state: RootState) => state.app.author;
export const selectAppHomepage = (state: RootState) => state.app.homepage;
export const selectAppConnected = (state: RootState) => state.app.connected;

export default appSlice.reducer;
