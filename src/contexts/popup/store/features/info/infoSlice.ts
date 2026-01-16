import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { RootState } from "@/contexts/popup/store";

export interface InfoState {
  data: Record<string, any>;
}

const initialState: InfoState = {
  data: {},
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
    builder.addCase(getInfoAsync.fulfilled, (state, action) => {
      state.data = action.payload;
    });
  },
});

export const {} = infoSlice.actions;

export const selectInfo = (state: RootState) => state.info.data;

export default infoSlice.reducer;
