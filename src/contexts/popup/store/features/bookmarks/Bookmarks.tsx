import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectBookmarks,
  selectBookmarkTitle,
  selectBookmarksLoading,
  loadBookmarksAsync,
  removeBookmarkAsync,
} from "./bookmarksSlice";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import { Bookmark } from "./Bookmark";
import { DraggableBookmark } from "./DraggableBookmark";
import { BookmarkAddButton } from "./BookmarkAddButton";
import { BookmarkTrash } from "./BookmarkTrash";

import { Loading } from "@/components/Loading";
import { ScrollContainer } from "@/components/ScrollContainer/ScrollContainer";

import style from "./Bookmarks.module.scss";

import type { BookmarkInfo } from "./bookmarksSlice";

export const Bookmarks = ({}: Bookmarks.Props) => {
  const dispatch = useAppDispatch();
  const bookmarks = useAppSelector(selectBookmarks);
  const bookmarkTitle = useAppSelector(selectBookmarkTitle);
  const loading = useAppSelector(selectBookmarksLoading);

  const [showTrash, setShowTrash] = React.useState(false);
  const [activeBookmarkUrl, setActiveBookmarkUrl] = React.useState<
    string | null
  >(null);

  const activeBookmark = React.useMemo(() => {
    return activeBookmarkUrl
      ? bookmarks.find((b) => b.url === activeBookmarkUrl) || null
      : null;
  }, [activeBookmarkUrl, bookmarks.length]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  React.useEffect(() => {
    dispatch(loadBookmarksAsync());
  }, []);

  const onDragEnd = (e: DragEndEvent) => {
    setActiveBookmarkUrl(null);
    setShowTrash(false);

    if (e.over && e.over.id === "bookmark-trash") {
      const bookmark = e.active.data.current as BookmarkInfo;
      dispatch(removeBookmarkAsync(bookmark.url));
    }
  };

  const onDragStart = (e: DragEndEvent) => {
    setActiveBookmarkUrl((e.active.data.current as BookmarkInfo).url);
    setShowTrash(true);
  };

  return (
    <Loading loading={loading} spinnerSize={"2rem"}>
      <DndContext
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        sensors={sensors}
      >
        <div className={style.bookmarks}>
          <ScrollContainer
            className={style.bookmarksScrollbox}
            locked={showTrash}
          >
            <div className={style.bookmarksContent}>
              {bookmarks.map((bookmark) => (
                <DraggableBookmark key={bookmark.url} bookmark={bookmark} />
              ))}
              <BookmarkAddButton />
            </div>
          </ScrollContainer>
        </div>
        <div>
          <div className={style.bookmarksLink}>
            <span>{activeBookmark ? activeBookmark.title : bookmarkTitle}</span>
          </div>
          <BookmarkTrash show={showTrash} />
        </div>
        <DragOverlay>
          {activeBookmark ? (
            <Bookmark bookmark={activeBookmark} overlay />
          ) : null}
        </DragOverlay>
      </DndContext>
    </Loading>
  );
};

export namespace Bookmarks {
  export interface Props {}
}
