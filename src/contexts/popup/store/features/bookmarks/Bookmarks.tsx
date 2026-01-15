import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectBookmarks,
  selectBookmarkTitle,
  loadBookmarksAsync,
} from "./bookmarksSlice";

import { Bookmark } from "./Bookmark";
import { BookmarkAddButton } from "./BookmarkAddButton";

import style from "./Bookmarks.module.scss";

export const Bookmarks = ({}: Bookmarks.Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(selectBookmarks);
  const bookmarkTitle = useAppSelector(selectBookmarkTitle);

  React.useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, []);

  return (
    <div className={style.bookmarks}>
      <div className={style.bookmarksScrollbox}>
        <div className={style.bookmarksContent}>
          {bookmarks.map((bookmark) => (
            <Bookmark key={bookmark.url} bookmark={bookmark} />
          ))}
          <BookmarkAddButton />
        </div>
      </div>
      <div className={style.bookmarksLink}>
        <span>{bookmarkTitle}</span>
      </div>
    </div>
  );
};

export namespace Bookmarks {
  export interface Props {}
}
