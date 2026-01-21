import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  fetchLoggedInStatusAsync,
  fetchPageTypeAsync,
  openDataManagerAsync,
  importFromMapgenieAccountAsync,
  clearMapDataAsync,
  clearGameDataAsync,
  isBusy,
  isLoggedIn,
  getPageType,
} from "./dataSlice";
import { FontIcon } from "@/components/FontIcon";
import { Loading } from "@/components/Loading";

import style from "./Data.module.scss";
import { Confirm } from "@/components";

interface ModalState {
  message: string;
  onAccept: () => void;
  onCancel: () => void;
}

export const Data = ({}: Data.Props) => {
  const dispatch = useAppDispatch();
  const busy = useAppSelector(isBusy);
  const loggedIn = useAppSelector(isLoggedIn);
  const pageType = useAppSelector(getPageType);

  const [modalState, setModalState] = React.useState<ModalState | null>(null);

  const isMap = pageType === "map";
  const isGuide = pageType === "guide";

  const importFromAccountEnabled = loggedIn && (isGuide || isMap);
  const clearMapEnabled = loggedIn && isMap;
  const clearGameEnabled = loggedIn && (isGuide || isMap);

  const onImportFromAccountClick = React.useCallback(() => {
    setModalState({
      message:
        "Import data from your Mapgenie account? This will overwrite your current game data.",
      onAccept: () => {
        setModalState(null);
        dispatch(importFromMapgenieAccountAsync());
      },
      onCancel: () => setModalState(null),
    });
  }, []);

  const onClearMapClick = React.useCallback(() => {
    setModalState({
      message:
        "Clear all locations for the current map? This action cannot be undone.",
      onAccept: () => {
        setModalState(null);
        dispatch(clearMapDataAsync());
      },
      onCancel: () => setModalState(null),
    });
  }, []);

  const onClearGameClick = React.useCallback(() => {
    setModalState({
      message:
        "Clear all data for the current game? This action cannot be undone.",
      onAccept: () => {
        setModalState(null);
        dispatch(clearGameDataAsync());
      },
      onCancel: () => setModalState(null),
    });
  }, []);

  React.useEffect(() => {
    dispatch(fetchLoggedInStatusAsync());
    dispatch(fetchPageTypeAsync());
  }, []);

  const onOpenDataManager = React.useCallback(() => {
    dispatch(openDataManagerAsync());
  }, [dispatch]);

  return (
    <Loading loading={busy} overlay spinnerSize="2rem">
      <Confirm visible={modalState !== null} {...modalState} />
      <div className={style.data}>
        <button className={style.btn} onClick={onOpenDataManager}>
          <FontIcon icon="open-new-tab" className={style.icon} />
          <span>Open data manager</span>
        </button>
        <button
          className={style.btn}
          disabled={!importFromAccountEnabled}
          onClick={onImportFromAccountClick}
        >
          <FontIcon icon="person-import" className={style.icon} />
          <span>Import from Mapgenie account</span>
        </button>
        <button
          className={style.btn}
          id={style.clearGame}
          disabled={!clearGameEnabled}
          onClick={onClearGameClick}
        >
          <FontIcon icon="trash" className={style.icon} />
          <span>Clear current game</span>
        </button>
        <button
          className={style.btn}
          id={style.clearMap}
          disabled={!clearMapEnabled}
          onClick={onClearMapClick}
        >
          <FontIcon icon="trash" className={style.icon} />
          <span>Clear current map</span>
        </button>
      </div>
    </Loading>
  );
};

namespace Data {
  export interface Props {}
}
