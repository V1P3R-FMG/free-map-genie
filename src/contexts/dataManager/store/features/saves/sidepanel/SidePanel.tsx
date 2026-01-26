import { SaveList } from "./SaveList";
import { Import } from "./Import";

import style from "./SidePanel.module.scss";

export const SidePanel = ({}: SidePanel.Props) => {
  return (
    <div className={style.sidePanel}>
      <SaveList />
      <Import />
    </div>
  );
};

namespace SidePanel {
  export interface Props {}
}
