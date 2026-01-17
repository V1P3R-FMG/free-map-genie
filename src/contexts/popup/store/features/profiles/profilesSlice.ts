import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getInfoAsync } from "../info/infoSlice";

import type { RootState } from "@/contexts/popup/store";
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

export const getProfilesAsync = createAsyncThunk<ProfileInfo[], void>(
  "profiles/getProfiles",
  async (_, { getState }) => {
    const state = getState() as RootState;
    const profiles = await state.services.backend.getProfiles();
    return profiles;
  }
);

export const addGuestProfileAsync = createAsyncThunk<
  ProfileInfo | undefined,
  void
>("profiles/addGuestProfile", async (_, { getState }) => {
  const state = getState() as RootState;
  const newProfile = await state.services.backend.addGuestProfile();
  return newProfile;
});

export const deleteGuestProfileAsync = createAsyncThunk<
  ProfileInfo[] | undefined,
  void
>("profiles/deleteGuestProfile", async (_, { getState }) => {
  const state = getState() as RootState;
  const profiles = await state.services.backend.deleteGuestProfile();
  return profiles;
});

export const activateProfileAsync = createAsyncThunk<number, number>(
  "profiles/activateProfile",
  async (profileId, { getState }) => {
    const state = getState() as RootState;
    await state.services.backend.activateProfile(profileId);
    await state.services.background.reloadActiveTab();
    return profileId;
  }
);

export const profilesSlice = createSlice({
  name: "profiles",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getProfilesAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getProfilesAsync.fulfilled, (state, action) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(getProfilesAsync.rejected, (state) => {
      state.list = [];
      state.loading = false;
    });
    builder.addCase(addGuestProfileAsync.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return;
      }
      state.list.push(action.payload);
    });
    builder.addCase(addGuestProfileAsync.rejected, (state, action) => {
      logger.error("Failed to add profile:", action.error);
    });
    builder.addCase(deleteGuestProfileAsync.fulfilled, (state, action) => {
      if (action.payload === undefined) {
        return;
      }
      state.list = action.payload;
    });
    builder.addCase(deleteGuestProfileAsync.rejected, (state, action) => {
      logger.error("Failed to delete profile:", action.error);
    });
    builder.addCase(activateProfileAsync.fulfilled, (state, action) => {
      state.list = state.list.map((profile) => ({
        ...profile,
        active: profile.id === action.payload,
      }));
    });
    builder.addCase(activateProfileAsync.rejected, (state, action) => {
      logger.error("Failed to activate profile:", action.error);
    });
  },
});

export const {} = profilesSlice.actions;

export const selectProfiles = (state: RootState) => state.profiles.list;
export const selectProfilesLoading = (state: RootState) =>
  state.profiles.loading;

export default profilesSlice.reducer;
