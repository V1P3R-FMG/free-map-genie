import { SaveList } from "./savelist";
import { Import } from "./import";

import style from "./sidepanel.module.scss";

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
