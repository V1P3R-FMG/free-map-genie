import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectBookmarks,
  loadBookmarksAsync,
  addBookmarkAsync,
  removeBookmarkAsync,
} from "./bookmarksSlice";

import { Bookmark } from "./Bookmark";
import { BookmarkAddButton } from "./BookmarkAddButton";

import style from "./Bookmarks.module.scss";

export const Bookmarks = ({}: Bookmarks.Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(selectBookmarks);

  const onAddBookmarkClick = () => dispatch(addBookmarkAsync());
  const onRemoveBookmark = (url: string) => dispatch(removeBookmarkAsync(url));

  React.useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, []);

  return (
    <div className={style.bookmarks}>
      {bookmarks.map((bookmark) => (
        <Bookmark key={bookmark.url} bookmark={bookmark} />
      ))}
      <BookmarkAddButton onClick={onAddBookmarkClick} />
    </div>
  );
};

export namespace Bookmarks {
  export interface Props {}
}
