import { FontIcon } from "@/components/FontIcon";
import { useDroppable } from "@dnd-kit/core";

import style from "./Bookmarks.module.scss";

export const BookmarkTrash = ({ show }: BookmarkTrash.Props) => {
  const { setNodeRef, isOver } = useDroppable({ id: "bookmark-trash" });

  return (
    <div className={style.bookmarkTrashContainer}>
      <div
        className={clsx(style.bookmarkTrash, {
          [style.show]: show,
          [style.over]: isOver,
        })}
        ref={setNodeRef}
      >
        <FontIcon icon="trash" size="1rem" />
      </div>
    </div>
  );
};

export namespace BookmarkTrash {
  export interface Props {
    show: boolean;
  }
}
