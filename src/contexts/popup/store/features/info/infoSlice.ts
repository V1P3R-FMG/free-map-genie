import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../typed";

export interface InfoState {
  data: Record<string, any>;
  loading: boolean;
}

const initialState: InfoState = {
  data: {},
  loading: true,
};

export const getInfoAsync = createAppAsyncThunk<Record<string, any>, void>(
  "info/getInfo",
  async (_, { extra: { services } }) => {
    return services.page.getInfo();
  }
);

export const infoSlice = createSlice({
  name: "info",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getInfoAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInfoAsync.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(getInfoAsync.rejected, (state, action) => {
        state.data = {};
        state.loading = false;
        logger.error("Failed to get info", action.error);
      });
  },
  selectors: {
    selectInfo: (state) => state.data,
    selectInfoLoading: (state) => state.loading,
  },
});

export const {} = infoSlice.actions;

export const { selectInfo, selectInfoLoading } = infoSlice.selectors;

export default infoSlice.reducer;
