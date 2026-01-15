import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./features/app/appSlice";
import bookmakrsReducer from "./features/bookmarks/bookmarksSlice";
import servicesReducer from "./features/services/servicesSlice";

export const store = configureStore({
  reducer: {
    bookmarks: bookmakrsReducer,
    app: appReducer,
    services: servicesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
