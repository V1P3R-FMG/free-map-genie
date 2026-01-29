import { createSlice } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "../../typed";
import { toastr } from "react-redux-toastr";

import type { Bookmark as BookmarkInfo } from "@/common/bookmark";

export { BookmarkInfo };

export interface BookmarksState {
  list: BookmarkInfo[];
  title: Record<string, number>;
  loading: boolean;
}

const initialState: BookmarksState = {
  list: [],
  title: {},
  loading: true,
};

export const addBookmarkAsync = createAppAsyncThunk<BookmarkInfo, void>(
  "bookmarks/addBookmark",
  async (_, { extra: { services } }) => {
    try {
      const bookmark = await services.page.createBookmark();
      await services.backend.addBookmark(bookmark);

      return bookmark;
    } catch (e) {
      toastr.error("Error", "Failed to add bookmark");
      logger.error("Failed to add bookmark", e);
      throw e;
    }
  }
);

export const removeBookmarkAsync = createAppAsyncThunk<void, string>(
  "bookmarks/removeBookmark",
  async (url, { extra: { services } }) => {
    try {
      await services.backend.deleteBookmark(url);
    } catch (e) {
      toastr.error("Error", "Failed to remove bookmark");
      logger.error("Failed to remove bookmark", e);
    }
  }
);

export const loadBookmarksAsync = createAppAsyncThunk<BookmarkInfo[], void>(
  "bookmarks/loadBookmarks",
  async (_, { extra: { services } }) => {
    try {
      return await services.backend.getBookmarks();
    } catch (e) {
      toastr.error("Error", "Failed to load bookmarks");
      logger.error("Failed to load bookmarks", e);
      return [];
    }
  }
);

export const bookmarksSlice = createSlice({
  name: "bookmarks",
  initialState,
  reducers: {
    removeBookmarkTitle(state, action: { payload: string }) {
      if (state.title[action.payload]) {
        const result = (state.title[action.payload] -= 1);
        if (result <= 0) {
          delete state.title[action.payload];
        }
      }
    },
    setBookmarkTitle(state, action: { payload: string }) {
      state.title[action.payload] ??= 0;
      state.title[action.payload] += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addBookmarkAsync.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(removeBookmarkAsync.fulfilled, (state, action) => {
        state.list = state.list.filter(
          (bookmark) => bookmark.url !== action.meta.arg
        );
      })
      .addCase(loadBookmarksAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadBookmarksAsync.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      });
  },
  selectors: {
    selectBookmarks: (state) => state.list,
    selectBookmarkTitle: (state) => Object.keys(state.title)[0] || "",
    selectBookmarksLoading: (state) => state.loading,
  },
});

export const { removeBookmarkTitle, setBookmarkTitle } = bookmarksSlice.actions;

export const { selectBookmarks, selectBookmarkTitle, selectBookmarksLoading } =
  bookmarksSlice.selectors;

export default bookmarksSlice.reducer;
