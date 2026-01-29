import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../typed";

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
    return services.backend.getProfiles();
  }
);

export const addGuestProfileAsync = createAppAsyncThunk<
  ProfileInfo | undefined,
  void
>("profiles/addGuestProfile", async (_, { extra: { services } }) => {
  return services.backend.addGuestProfile();
});

export const deleteGuestProfileAsync = createAppAsyncThunk<
  ProfileInfo[] | undefined,
  void
>("profiles/deleteGuestProfile", async (_, { extra: { services } }) => {
  return services.backend.deleteGuestProfile();
});

export const activateProfileAsync = createAppAsyncThunk<number, number>(
  "profiles/activateProfile",
  async (profileId, { extra: { services } }) => {
    await services.backend.setActiveProfile(profileId);
    await services.background.reloadActiveTab();
    return profileId;
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
      .addCase(getProfilesAsync.rejected, (state) => {
        state.list = [];
        state.loading = false;
      })
      .addCase(addGuestProfileAsync.fulfilled, (state, action) => {
        if (action.payload === undefined) {
          return;
        }
        state.list.push(action.payload);
      })
      .addCase(addGuestProfileAsync.rejected, (state, action) => {
        logger.error("Failed to add profile:", action.error);
      })
      .addCase(deleteGuestProfileAsync.fulfilled, (state, action) => {
        if (action.payload === undefined) {
          return;
        }
        state.list = action.payload;
      })
      .addCase(deleteGuestProfileAsync.rejected, (state, action) => {
        logger.error("Failed to delete profile:", action.error);
      })
      .addCase(activateProfileAsync.fulfilled, (state, action) => {
        state.list = state.list.map((profile) => ({
          ...profile,
          active: profile.id === action.payload,
        }));
      })
      .addCase(activateProfileAsync.rejected, (state, action) => {
        logger.error("Failed to activate profile:", action.error);
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
