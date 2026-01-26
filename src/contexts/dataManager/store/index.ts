import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./features/app/appSlice";
import savesReducer from "./features/saves/savesSlice";
import { reducer as toastrReducer } from "react-redux-toastr";

import pageService from "@/services/page.service";
import backendService from "@/services/backend.service";
import backgroundService from "@/services/background.service";
import mapgenieService from "@/services/mapgenie.service";

export const store = configureStore({
  reducer: {
    app: appReducer,
    saves: savesReducer,
    toastr: toastrReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: {
          services: {
            page: pageService.use(),
            backend: backendService.use(),
            background: backgroundService.use(),
            mapgenie: mapgenieService.use(),
          },
        },
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
