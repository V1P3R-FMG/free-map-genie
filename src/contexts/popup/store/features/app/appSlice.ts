import { createSlice } from "@reduxjs/toolkit";
import { compareVersions, displayVersion } from "@/common/version";
import { createAppAsyncThunk } from "../../typed";

export interface AppState {
  version: string;
  latest: string;
  displayVersion: string;
  isDevBuild: boolean;
  needsUpdate: boolean;
  author: string;
  homepage: string;
  connected: boolean;
  loading: boolean;
  enabled: boolean;
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
  loading: true,
  enabled: true,
};

export const fetchIsAppEnabledAsync = createAppAsyncThunk<boolean>(
  "app/fetchIsAppEnabled",
  async (_, { extra: { services } }) => {
    return services.background.getExtensionEnabled();
  }
);

export const setIsAppEnabledAsync = createAppAsyncThunk<void, boolean>(
  "app/setIsAppEnabled",
  async (enabled, { extra: { services } }) => {
    return services.background.setExtensionEnabled(enabled);
  }
);

export const fetchLatestVersionAsync = createAppAsyncThunk<string>(
  "app/fetchLatestVersion",
  async (_, { getState }) => {
    const homepage = selectAppHomepage(getState());

    const url = new URL("https://raw.githubusercontent.com");
    url.pathname = new URL(homepage).pathname + "/main/package.json";

    const res = await fetch(url.toString());
    const json = await res.json();

    return json.version as string;
  }
);

export const reloadActiveTabAsync = createAppAsyncThunk<void>(
  "app/reloadActiveTab",
  async (_, { extra: { services } }) => {
    await services.background.reloadActiveTab();
  }
);

export const updateConnectedStatusAsync = createAppAsyncThunk(
  "app/fetchConnectedStatus",
  async (_, { extra: { services } }) => {
    await services.page.ping();
  }
);

export const injectIconFontAsync = createAppAsyncThunk(
  "app/injectIconFont",
  async (_) => {
    await injectStyle("/assets/fmg-icons.css");
  }
);

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIsAppEnabledAsync.fulfilled, (state, action) => {
        state.enabled = action.payload;
      })
      .addCase(fetchIsAppEnabledAsync.rejected, (state, action) => {
        logger.error("Failed to get is extension enabled status", action.error);
      })
      .addCase(setIsAppEnabledAsync.fulfilled, (state, action) => {
        state.enabled = !state.enabled;
      })
      .addCase(setIsAppEnabledAsync.rejected, (state, action) => {
        logger.error("Failed to set is extension enabled status", action.error);
      })
      .addCase(fetchLatestVersionAsync.fulfilled, (state, action) => {
        state.latest = action.payload;
        state.needsUpdate = compareVersions(state.latest, state.version) > 0;
      })
      .addCase(fetchLatestVersionAsync.rejected, (state, action) => {
        logger.error("Failed to fetch latest version", action.error);
      })
      .addCase(updateConnectedStatusAsync.fulfilled, (state, action) => {
        state.connected = true;
      })
      .addCase(updateConnectedStatusAsync.rejected, (state, action) => {
        state.connected = false;
        logger.error("Failed to update connected status", action.error);
      })
      .addCase(injectIconFontAsync.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(injectIconFontAsync.rejected, (state, action) => {
        state.loading = false;
        logger.error("Failed to inject icon font", action.error);
      });
  },
  selectors: {
    selectAppEnabled: (state) => state.enabled,
    selectAppVersion: (state) => state.version,
    selectAppLatestVersion: (state) => state.latest,
    selectAppDisplayVersion: (state) => state.displayVersion,
    selectAppIsDevBuild: (state) => state.isDevBuild,
    selectAppNeedsUpdate: (state) => state.needsUpdate,
    selectAppAuthor: (state) => state.author,
    selectAppHomepage: (state) => state.homepage,
    selectAppConnected: (state) => state.connected,
    selectAppLoading: (state) => state.loading,
  },
});

export const {} = appSlice.actions;

export const {
  selectAppEnabled,
  selectAppVersion,
  selectAppLatestVersion,
  selectAppDisplayVersion,
  selectAppIsDevBuild,
  selectAppNeedsUpdate,
  selectAppAuthor,
  selectAppHomepage,
  selectAppConnected,
  selectAppLoading,
} = appSlice.selectors;

export default appSlice.reducer;
