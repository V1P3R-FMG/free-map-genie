import style from "./Modal.module.scss";

export const Modal = (props: Modal.Props) => {
  if (!props.show) return null;

  return (
    <div className={style.modalOverlay}>
      <div className={style.container}>{props.children}</div>
    </div>
  );
};

namespace Modal {
  export interface Props extends React.PropsWithChildren {
    show?: boolean;
  }
}
