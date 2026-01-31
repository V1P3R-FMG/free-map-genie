import { createSlice } from "@reduxjs/toolkit";
import { compareVersions, displayVersion } from "@/common/version";
import { createAppAsyncThunk } from "../../typed";
import { toastr } from "react-redux-toastr";

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
    try {
      return services.background.getExtensionEnabled();
    } catch (e) {
      toastr.error("Error", "Failed to get extension enabled status");
      logger.error("Failed to get is extension enabled status", e);
      return false;
    }
  }
);

export const setIsAppEnabledAsync = createAppAsyncThunk<void, boolean>(
  "app/setIsAppEnabled",
  async (enabled, { extra: { services } }) => {
    try {
      await services.background.setExtensionEnabled(enabled);
    } catch (e) {
      toastr.error("Error", "Failed to set extension enabled status");
      logger.error("Failed to set is extension enabled status", e);
    }
  }
);

export const fetchLatestVersionAsync = createAppAsyncThunk<string>(
  "app/fetchLatestVersion",
  async (_, { getState }) => {
    try {
      const homepage = selectAppHomepage(getState());
      const { pathname } = new URL(homepage);

      const url = new URL("https://api.github.com");
      url.pathname = "/repos" + pathname + "/releases/latest";

      const res = await fetch(url.toString());
      const json: {
        tag_name: string;
      } = await res.json();

      logger.debug(
        json.tag_name.replace(/^v/, "").replace(/-[\w]+(\.\d+)?$/, "")
      );

      return json.tag_name.replace(/^v/, "").replace(/-[\w]+(\.\d+)?$/, "");
    } catch (e) {
      toastr.error("Error", "Failed to fetch latest version");
      logger.error("Failed to fetch latest version", e);
      return selectAppVersion(getState());
    }
  }
);

export const reloadActiveTabAsync = createAppAsyncThunk<void>(
  "app/reloadActiveTab",
  async (_, { extra: { services } }) => {
    try {
      await services.background.reloadActiveTab();
    } catch (e) {
      toastr.error("Error", "Failed to reload active tab");
      logger.error("Failed to reload active tab", e);
    }
  }
);

export const updateConnectedStatusAsync = createAppAsyncThunk(
  "app/fetchConnectedStatus",
  async (_, { extra: { services } }) => {
    try {
      await services.page.ping();
    } catch (e) {
      toastr.error("Error", "Failed to update connected status");
      logger.error("Failed to update connected status", e);
    }
  }
);

export const injectIconFontAsync = createAppAsyncThunk(
  "app/injectIconFont",
  async (_) => {
    try {
      await injectStyle("/assets/fmg-icons.css");
    } catch (e) {
      toastr.error("Error", "Failed to inject icon font");
      logger.error("Failed to inject icon font", e);
    }
  }
);

export const closeWindowAsync = createAppAsyncThunk(
  "app/closeWindow",
  async (_, { extra: { services } }) => {
    if (window.self !== window.top) {
      await services.extension.closePopup();
    } else {
      window.close();
    }
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
      .addCase(setIsAppEnabledAsync.fulfilled, (state, action) => {
        state.enabled = !state.enabled;
      })
      .addCase(fetchLatestVersionAsync.fulfilled, (state, action) => {
        state.latest = action.payload;
        state.needsUpdate = compareVersions(state.latest, state.version) > 0;
      })
      .addCase(updateConnectedStatusAsync.pending, (state, action) => {
        state.connected = false;
      })
      .addCase(updateConnectedStatusAsync.fulfilled, (state, action) => {
        state.connected = true;
      })
      .addCase(injectIconFontAsync.fulfilled, (state) => {
        state.loading = false;
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
