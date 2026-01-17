import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type { Bookmark as BookmarkInfo } from "@/common/bookmark";
import type { RootState } from "@/contexts/popup/store";

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

export const addBookmarkAsync = createAsyncThunk<BookmarkInfo, void>(
  "bookmarks/addBookmark",
  async (_, { getState }) => {
    const state = getState() as RootState;

    const bookmark = await state.services.page.createBookmark();
    await state.services.backend.addBookmark(bookmark);

    return bookmark;
  }
);

export const removeBookmarkAsync = createAsyncThunk<void, string>(
  "bookmarks/removeBookmark",
  async (url, { getState }) => {
    const state = getState() as RootState;
    await state.services.backend.deleteBookmark(url);
  }
);

export const loadBookmarksAsync = createAsyncThunk<BookmarkInfo[], void>(
  "bookmarks/loadBookmarks",
  async (_, { getState }) => {
    const state = getState() as RootState;

    const bookmarks = await state.services.backend.getBookmarks();

    return bookmarks;
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
    builder.addCase(addBookmarkAsync.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(addBookmarkAsync.rejected, (state, action) => {
      logger.error("Failed to add bookmark", action.error);
    });
    builder.addCase(removeBookmarkAsync.fulfilled, (state, action) => {
      state.list = state.list.filter(
        (bookmark) => bookmark.url !== action.meta.arg
      );
    });
    builder.addCase(removeBookmarkAsync.rejected, (state, action) => {
      logger.error("Failed to remove bookmark", action.error);
    });
    builder.addCase(loadBookmarksAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(loadBookmarksAsync.fulfilled, (state, action) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(loadBookmarksAsync.rejected, (state, action) => {
      state.loading = false;
      logger.error("Failed to load bookmarks", action.error);
    });
  },
});

export const { removeBookmarkTitle, setBookmarkTitle } = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.list;
export const selectBookmarkTitle = (state: RootState) =>
  Object.keys(state.bookmarks.title)[0] || "";
export const selectBookmarksLoading = (state: RootState) =>
  state.bookmarks.loading;

export default bookmarksSlice.reducer;
