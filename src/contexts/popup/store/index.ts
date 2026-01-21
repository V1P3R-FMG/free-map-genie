import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./features/app/appSlice";
import bookmakrsReducer from "./features/bookmarks/bookmarksSlice";
import servicesReducer from "./features/services/servicesSlice";
import infoReducer from "./features/info/infoSlice";
import profilesReducer from "./features/profiles/profilesSlice";
import dataReducer from "./features/data/dataSlice";

export const store = configureStore({
  reducer: {
    bookmarks: bookmakrsReducer,
    app: appReducer,
    services: servicesReducer,
    info: infoReducer,
    profiles: profilesReducer,
    data: dataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [
          "services.page",
          "services.backend",
          "services.background",
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
