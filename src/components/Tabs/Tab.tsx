import { FontIcon, type FmgIconsId } from "@/components/FontIcon";

import style from "./Tabs.module.scss";

export const Tab = (props: Tab.Props) => {
  return (
    <div
      className={clsx(style.tab, { [style.active]: props.selected })}
      onClick={() => props.onClick?.(props.name)}
    >
      <FontIcon icon={props.icon} size="1.2rem" />
    </div>
  );
};

export namespace Tab {
  export interface Props {
    name: string;
    icon: FmgIconsId;
    selected?: boolean;
    onClick?: (name: string) => void;
  }
}
