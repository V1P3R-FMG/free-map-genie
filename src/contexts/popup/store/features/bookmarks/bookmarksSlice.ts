import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import pageService from "@/services/page.service";
import backendService from "@/services/backend.service";

import type { Bookmark as BookmarkInfo } from "@/common/bookmark";
import type { RootState } from "@/contexts/popup/store";

export { BookmarkInfo };

export interface BookmarksState {
  list: BookmarkInfo[];
}

const initialState: BookmarksState = {
  list: [],
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
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addBookmarkAsync.fulfilled, (state, action) => {
      state.list.push(action.payload);
    });
    builder.addCase(removeBookmarkAsync.fulfilled, (state, action) => {
      state.list = state.list.filter(
        (bookmark) => bookmark.url !== action.meta.arg
      );
    });
    builder.addCase(loadBookmarksAsync.fulfilled, (state, action) => {
      state.list = action.payload;
    });
  },
});

export const {} = bookmarksSlice.actions;

export const selectBookmarks = (state: RootState) => state.bookmarks.list;

export default bookmarksSlice.reducer;
