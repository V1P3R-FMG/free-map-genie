import { useDraggable } from "@dnd-kit/core";
import { Bookmark } from "./Bookmark";

import style from "./Bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksSlice";

export const DraggableBookmark = ({ bookmark }: DraggableBookmark.Props) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: bookmark.url,
    data: bookmark,
  });

  return (
    <button
      className={clsx(style.draggableBookmark, {
        [style.dragging]: isDragging,
      })}
      ref={setNodeRef}
      {...attributes}
      {...listeners}
    >
      <Bookmark bookmark={bookmark} />
    </button>
  );
};

export namespace DraggableBookmark {
  export interface Props {
    bookmark: BookmarkInfo;
  }
}
