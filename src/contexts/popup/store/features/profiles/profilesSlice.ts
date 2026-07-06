import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../typed";
import { toastr } from "react-redux-toastr";

import type { Profile as ProfileInfo } from "@/common/profile";

export type { ProfileInfo };

export interface ProfilesState {
  list: any[];
  loading: boolean;
}

const initialState: ProfilesState = {
  list: [],
  loading: true,
};

export const getProfilesAsync = createAppAsyncThunk<ProfileInfo[], void>(
  "profiles/getProfiles",
  async (_, { extra: { services } }) => {
    try {
      return await services.backend.getProfiles();
    } catch (e) {
      toastr.error("Error", "Failed to get profiles");
      logger.error("Failed to get profiles", e);
      return [];
    }
  }
);

export const addGuestProfileAsync = createAppAsyncThunk<
  ProfileInfo | undefined,
  void
>("profiles/addGuestProfile", async (_, { extra: { services } }) => {
  try {
    return await services.backend.addGuestProfile();
  } catch (e) {
    toastr.error("Error", "Failed to add guest profile");
    logger.error("Failed to add guest profile", e);
    return undefined;
  }
});

export const deleteGuestProfileAsync = createAppAsyncThunk<
  ProfileInfo[] | undefined,
  void
>("profiles/deleteGuestProfile", async (_, { extra: { services } }) => {
  try {
    return await services.backend.deleteGuestProfile();
  } catch (e) {
    toastr.error("Error", "Failed to delete guest profile");
    logger.error("Failed to delete guest profile", e);
    return undefined;
  }
});

export const activateProfileAsync = createAppAsyncThunk<number, number>(
  "profiles/activateProfile",
  async (profileId, { extra: { services } }) => {
    try {
      await services.backend.setActiveProfile(profileId);
      await services.background.reloadActiveTab();
      return profileId;
    } catch (e) {
      toastr.error("Error", "Failed to activate profile");
      logger.error("Failed to activate profile", e);
      return profileId;
    }
  }
);

export const profilesSlice = createSlice({
  name: "profiles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProfilesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfilesAsync.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(addGuestProfileAsync.fulfilled, (state, action) => {
        if (action.payload === undefined) {
          return;
        }
        state.list.push(action.payload);
      })
      .addCase(deleteGuestProfileAsync.fulfilled, (state, action) => {
        if (action.payload === undefined) {
          return;
        }
        state.list = action.payload;
      })
      .addCase(activateProfileAsync.fulfilled, (state, action) => {
        state.list = state.list.map((profile) => ({
          ...profile,
          active: profile.id === action.payload,
        }));
      });
  },
  selectors: {
    selectProfiles: (state) => state.list,
    selectProfilesLoading: (state) => state.loading,
  },
});

export const {} = profilesSlice.actions;

export const { selectProfiles, selectProfilesLoading } =
  profilesSlice.selectors;

export default profilesSlice.reducer;
