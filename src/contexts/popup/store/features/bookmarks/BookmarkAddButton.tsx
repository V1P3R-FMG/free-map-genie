import style from "./Bookmarks.module.scss";

export const BookmarkAddButton = (props: BookmarkAddButton.Props) => {
  return (
    <div className={style.bookmarkContainer} onClick={props.onClick}>
      <div className={style.bookmarkAddIcon}>+</div>
    </div>
  );
};

export namespace BookmarkAddButton {
  export interface Props {
    onClick?: React.MouseEventHandler;
  }
}
