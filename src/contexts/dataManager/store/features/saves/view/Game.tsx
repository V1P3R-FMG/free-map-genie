import { useAppDispatch, useAppSelector } from "@/contexts/dataManager/hooks";
import { selectGameById } from "../../app/appSlice";
import { Stat } from "./Stat";

import style from "./Game.module.scss";

import type { UserData } from "@/common/storage";
import { selectIsGameSelected, setGameSelected } from "../savesSlice";

export const Game = ({ gameId, data }: Game.Props) => {
  const dispatch = useAppDispatch();
  const game = useAppSelector((state) => selectGameById(state, gameId));
  const title = game?.title ?? "Unknown Game" + ` (${gameId})`;

  const isGameSelected = useAppSelector((state) =>
    selectIsGameSelected(state, gameId)
  );

  const onCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setGameSelected({ gameId, selected: e.target.checked }));
  };

  return (
    <div className={style.gameItem}>
      <div className={style.gameCard}>
        <img
          src={game?.image}
          alt={`${title} icon`}
          className={style.preview}
        />
        <div className={style.details}>
          <div className={style.title}>{title}</div>
          <div className={style.info}>
            <Stat
              icon="geo"
              name="Locations"
              count={Object.keys(data.locations).length}
            />
            <Stat
              icon="tag"
              name="Categories"
              count={data.trackedCategoryIds.length}
            />
            <Stat icon="p-square" name="Presets" count={data.presets.length} />
            <Stat icon="note" name="Notes" count={data.notes.length} />
          </div>
        </div>
      </div>
      <Checkbox
        className={style.checkbox}
        checked={isGameSelected}
        onChange={onCheckedChange}
      />
    </div>
  );
};

export namespace Game {
  export interface Props {
    gameId: string;
    data: UserData;
  }
}
