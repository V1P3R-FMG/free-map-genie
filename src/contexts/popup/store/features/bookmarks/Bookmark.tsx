import style from "./Bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksSlice";

export const Bookmark = ({ bookmark }: Bookmark.Props) => {
  const { title, preview, icon } = bookmark;

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      await browser.tabs.create({ url: bookmark.url });
      window.close();
    } else if (e.button === 0) {
      await browser.tabs.update({ url: bookmark.url });
      window.close();
    }
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
      href={bookmark.url}
    >
      <img
        className={style.bookmarkPreview}
        src={preview}
        alt={title}
        title={title}
      />
      {icon && (
        <img className={style.bookmarkIcon} src={icon} alt="Bookmark icon" />
      )}
    </a>
  );
};

export namespace Bookmark {
  export interface Props {
    bookmark: BookmarkInfo;
  }
}
