import { useAppDispatch } from "@/contexts/popup/hooks";
import { setBookmarkTitle, removeBookmarkTitle } from "./bookmarksSlice";

import { Image } from "@/components/Image";

import style from "./Bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksSlice";

export const Bookmark = ({ bookmark, overlay }: Bookmark.Props) => {
  const dispatch = useAppDispatch();

  const { title, preview, icon, url } = bookmark;

  const onClick = async (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      await browser.tabs.create({ url });
      window.close();
    } else if (e.button === 0) {
      await browser.tabs.update({ url });
      window.close();
    }
  };

  const onMouseOver = () => {
    if (overlay) return;

    dispatch(setBookmarkTitle(title));
  };

  const onMouseOut = () => {
    if (overlay) return;

    setTimeout(() => {
      dispatch(removeBookmarkTitle(title));
    }, 100);
  };

  return (
    <div
      className={style.bookmarkContainer}
      onClick={onClick}
      onAuxClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Image
        className={style.bookmarkPreview}
        src={preview}
        draggable={false}
      />
      {icon && (
        <Image
          src={icon}
          className={style.bookmarkIcon}
          hideOnFail
          draggable={false}
        />
      )}
    </div>
  );
};

export namespace Bookmark {
  export interface Props {
    bookmark: BookmarkInfo;
    overlay?: boolean;
  }
}
