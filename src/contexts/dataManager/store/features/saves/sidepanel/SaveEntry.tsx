import { useAppDispatch, useAppSelector } from "@/contexts/dataManager/hooks";
import { setSelected, selectIsSelected, removeSave } from "../savesSlice";

import { SaveEntryFilename } from "./SaveEntryFilename";
import { VersionBadge } from "./VersionBadge";

import style from "./SaveEntry.module.scss";

import type { Save } from "@/common/storage/saves";

export const SaveEntry = ({ save, index }: SaveEntry.Props) => {
  const dispatch = useAppDispatch();

  const isSelected = useAppSelector((state) => selectIsSelected(state, index));

  const onClick = () => {
    dispatch(setSelected(index));
  };

  const onRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeSave(index));
  };

  return (
    <div className={clsx(style.saveEntry, isSelected && style.selected)}>
      <div role="button" className={style.info} onClick={onClick}>
        <div className={style.icon}>
          <FontIcon icon="file" size="1.5rem" />
          <VersionBadge version={save.version} />
        </div>
        <div>
          {save.filenames.map((filename) => (
            <SaveEntryFilename key={filename} filename={filename} />
          ))}
        </div>
      </div>
      <div className={style.remove}>
        <FontIcon
          className={style.iconBtn}
          icon="cross"
          onClick={onRemoveClick}
        />
      </div>
    </div>
  );
};

export namespace SaveEntry {
  export interface Props {
    save: Save;
    index: number;
  }
}
