import { useAppSelector } from "@/contexts/dataManager/hooks";
import {
  selectErrors,
  selectErrorCount,
  selectCurrentSave,
  selectIsBusy,
} from "../savesSlice";

import style from "./SaveView.module.scss";

import { Error } from "../errors/Error";
import { Game } from "./Game";

export const SaveView = ({}: SaveView.Props) => {
  const errors = useAppSelector(selectErrors);
  const save = useAppSelector(selectCurrentSave);
  const errorCount = useAppSelector((state) =>
    selectErrorCount(state, save ? save.filenames : [])
  );
  const busy = useAppSelector(selectIsBusy);

  if (save === null) {
    return null;
  }

  if (errorCount > 0) {
    return (
      <div className={style.saveView}>
        <div className={style.errors}>
          {save.filenames.map((filename) =>
            errors[filename]?.flatMap((error, i) => (
              <div key={i} className={style.error}>
                <div>Filename: {filename}</div>
                <Error error={error} />
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <Loading loading={busy} overlay spinnerSize="2rem">
      <div className={style.saveView}>
        {Object.entries(save.games).map(([gameId, game]) => (
          <Game key={gameId} gameId={gameId} data={game} />
        ))}
      </div>
    </Loading>
  );
};

namespace SaveView {
  export interface Props {}
}
