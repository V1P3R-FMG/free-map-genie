import { createSlice } from "@reduxjs/toolkit";

import pageService from "@/services/page.service";
import backendService from "@/services/backend.service";
import backgroundService from "@/services/background.service";

export interface ServicesState {
  page: pageService.Instance;
  backend: backendService.Instance;
  background: backgroundService.Instance;
}

const initialState: ServicesState = {
  page: pageService.use(),
  backend: backendService.use(),
  background: backgroundService.use(),
};

export const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {},
});

export const {} = servicesSlice.actions;

export default servicesSlice.reducer;
