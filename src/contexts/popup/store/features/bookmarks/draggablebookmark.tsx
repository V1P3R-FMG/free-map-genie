import { useDraggable } from "@dnd-kit/core";
import { Bookmark } from "./bookmark";

import style from "./bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksslice";

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
