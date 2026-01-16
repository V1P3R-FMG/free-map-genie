import { useAppDispatch } from "@/contexts/popup/hooks";
import {
  removeBookmarkAsync,
  setBookmarkTitle,
  removeBookmarkTitle,
} from "./bookmarksSlice";

import { Image } from "@/components/Image";

import style from "./Bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksSlice";

export const Bookmark = ({ bookmark }: Bookmark.Props) => {
  const dispatch = useAppDispatch();

  const { title, preview, icon, url } = bookmark;

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      await browser.tabs.create({ url });
      window.close();
    } else if (e.button === 0) {
      await browser.tabs.update({ url });
      window.close();
    }
  };

  const onRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(removeBookmarkAsync(url));
  };

  const onMouseOver = () => {
    dispatch(setBookmarkTitle(title));
  };

  const onMouseOut = () => {
    setTimeout(() => {
      dispatch(removeBookmarkTitle(title));
    }, 100);
  };

  // Prevent default context menu on bookmark items
  React.useEffect(() => {
    const f = (e: PointerEvent) => {
      if (e.target instanceof HTMLElement) {
        if (e.target.closest(`.${style.bookmarkContainer}`)) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener("contextmenu", f);

    return () => document.removeEventListener("contextmenu", f);
  });

  return (
    <a
      className={style.bookmarkContainer}
      onClick={onClick}
      onAuxClick={onClick}
      href={url}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      <Image
        className={style.bookmarkPreview}
        src={preview}
        alt="Bookmark preview"
      />
      {icon && (
        <Image src={icon} alt="Bookmark icon" className={style.bookmarkIcon} />
      )}
    </a>
  );
};

export namespace Bookmark {
  export interface Props {
    bookmark: BookmarkInfo;
  }
}
