import type { FmgIconsId } from "@/common/icons";

export type { FmgIconsId } from "@/common/icons";

import style from "./FontIcon.module.scss";

export const FontIcon = (props: FontIcon.Props) => {
  const size = props.size;
  return (
    <i
      id={props.id}
      className={clsx(style.icon, props.className, "fmg-icon-" + props.icon)}
      style={{
        fontSize: size,
        textAlign: "center",
      }}
      onClick={props.onClick}
      onAuxClick={props.auxClick}
      onMouseOver={props.onMouseOver}
      onMouseOut={props.onMouseOut}
      title={props.title}
    />
  );
};

export namespace FontIcon {
  export interface Props {
    icon: FmgIconsId;

    id?: string;
    className?: string;
    size?: string;
    title?: string;

    onClick?: React.MouseEventHandler;
    auxClick?: React.MouseEventHandler;
    onMouseOver?: React.MouseEventHandler;
    onMouseOut?: React.MouseEventHandler;
  }
}
