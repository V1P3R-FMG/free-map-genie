import style from "./Panel.module.scss";

export const Panel = (props: Panel.Props) => {
  return (
    <div className={clsx(style.panel, props.className)} id={props.id}>
      {props.children}
    </div>
  );
};

namespace Panel {
  export interface Props extends React.PropsWithChildren {
    id?: string;
    className?: string;
  }
}
