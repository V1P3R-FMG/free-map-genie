import { createSelector, createAsyncThunk } from "@reduxjs/toolkit";

import type pageService from "@/services/page.service";
import type backendService from "@/services/backend.service";
import type backgroundService from "@/services/background.service";
import type clientService from "@/services/client.service";
import type extensionService from "@/services/extension.service";

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
      client: clientService.Instance;
      extension: extensionService.Instance;
    };
  };
}>();
