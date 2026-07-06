import style from "./Stat.module.scss";

import type { FmgIconsId } from "@/common/icons";

export const Stat = ({ icon, name, count }: Stat.Props) => {
  return (
    <div className={style.stat}>
      <FontIcon icon={icon} size="1.2rem" title={name} />
      <span>{count}</span>
    </div>
  );
};

namespace Stat {
  export interface Props {
    icon: FmgIconsId;
    name: string;
    count: number;
  }
}
