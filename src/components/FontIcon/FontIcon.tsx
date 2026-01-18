import type { FmgIconsId } from "@/common/icons";

export type { FmgIconsId } from "@/common/icons";

import "./FontIcon.css";

export const FontIcon = (props: FontIcon.Props) => {
  const size = props.size ?? "1rem";
  return (
    <div className="fmg-icon-container">
      <i
        className={clsx(`fmg-icon-${props.icon}`, "fmg-icon", props.className)}
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
    </div>
  );
};

export namespace FontIcon {
  export interface Props {
    icon: FmgIconsId;

    className?: string;
    size?: string;
    title?: string;

    onClick?: React.MouseEventHandler;
    auxClick?: React.MouseEventHandler;
    onMouseOver?: React.MouseEventHandler;
    onMouseOut?: React.MouseEventHandler;
  }
}
