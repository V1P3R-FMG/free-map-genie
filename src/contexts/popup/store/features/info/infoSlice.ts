import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../typed";
import { toastr } from "react-redux-toastr";

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
    try {
      return services.page.getInfo();
    } catch (e) {
      toastr.error("Error", "Failed to get info");
      logger.error("Failed to get info", e);
      return {};
    }
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
