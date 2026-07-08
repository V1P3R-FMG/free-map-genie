import { useAppDispatch } from "@/contexts/popup/hooks";
import { addBookmarkAsync } from "./bookmarksslice";

import style from "./bookmarks.module.scss";

export const BookmarkAddButton = ({}: BookmarkAddButton.Props) => {
  const dispatch = useAppDispatch();

  const onClick = () => {
    dispatch(addBookmarkAsync());
  };

  return (
    <div className={style.bookmarkContainer} onClick={onClick}>
      <div className={style.bookmarkAddIcon}>+</div>
    </div>
  );
};

export namespace BookmarkAddButton {
  export interface Props {}
}
