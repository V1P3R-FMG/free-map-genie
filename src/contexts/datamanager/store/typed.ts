import { createSelector, createAsyncThunk } from "@reduxjs/toolkit";

import type pageService from "@/services/page.service";
import type backendService from "@/services/backend.service";
import type backgroundService from "@/services/background.service";
import type mapgenieService from "@/services/mapgenie.service";

import type { RootState, AppDispatch } from ".";

export const createAppSelector = createSelector.withTypes<RootState>();

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  extra: {
    services: {
      page: pageService.Instance;
      backend: backendService.Instance;
      background: backgroundService.Instance;
      mapgenie: mapgenieService.Instance;
    };
  };
}>();
