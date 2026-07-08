import { useAppSelector } from "@/contexts/dataManager/hooks";
import { selectSaves } from "../savesslice";

import { SaveEntry } from "./saveentry";

import style from "./savelist.module.scss";

export const SaveList = ({}: SaveList.Props) => {
  const saves = useAppSelector(selectSaves);

  return (
    <>
      <div className={style.header}>
        <h2>Saves</h2>
      </div>
      <ScrollContainer className={style.saveList}>
        {saves.map((save, i) => (
          <SaveEntry key={save.id} index={i} save={save} />
        ))}
      </ScrollContainer>
    </>
  );
};

namespace SaveList {
  export interface Props {}
}
