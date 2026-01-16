import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "@/contexts/popup/store";

export interface InfoState {
  data: Record<string, any>;
  loading: boolean;
}

const initialState: InfoState = {
  data: {},
  loading: true,
};

export const getInfoAsync = createAsyncThunk<Record<string, any>, void>(
  "info/getInfo",
  async (_, { getState }) => {
    const state = getState() as RootState;

    const info = await state.services.page.getInfo();

    return info;
  }
);

export const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getInfoAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getInfoAsync.fulfilled, (state, action) => {
      state.data = action.payload;
      state.loading = false;
    });
    builder.addCase(getInfoAsync.rejected, (state) => {
      state.data = {};
      state.loading = false;
    });
  },
});

export const {} = infoSlice.actions;

export const selectInfo = (state: RootState) => state.info.data;
export const selectInfoLoading = (state: RootState) => state.info.loading;

export default infoSlice.reducer;
