import { configureStore } from "@reduxjs/toolkit";

import pageService from "@/services/page.service";
import backendService from "@/services/backend.service";
import backgroundService from "@/services/background.service";
import clientService from "@/services/client.service";

import appReducer from "./features/app/appSlice";
import bookmakrsReducer from "./features/bookmarks/bookmarksSlice";
import infoReducer from "./features/info/infoSlice";
import profilesReducer from "./features/profiles/profilesSlice";
import dataReducer from "./features/data/dataSlice";

import { reducer as toastrReducer } from "react-redux-toastr";

export const store = configureStore({
  reducer: {
    bookmarks: bookmakrsReducer,
    app: appReducer,
    info: infoReducer,
    profiles: profilesReducer,
    data: dataReducer,
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
            client: clientService.use(),
          },
        },
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
