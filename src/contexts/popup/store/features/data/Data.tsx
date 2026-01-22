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

import style from "./Data.module.scss";

export const Data = ({}: Data.Props) => {
  const dispatch = useAppDispatch();
  const busy = useAppSelector(isBusy);
  const loggedIn = useAppSelector(isLoggedIn);
  const pageType = useAppSelector(getPageType);

  const isMap = pageType === "map";
  const isGuide = pageType === "guide";

  const importFromAccountEnabled = loggedIn && (isGuide || isMap);
  const clearMapEnabled = loggedIn && isMap;
  const clearGameEnabled = loggedIn && (isGuide || isMap);

  const {
    state: importFromAccountConfirmState,
    open: openImportFromAccountConfirm,
  } = useConfirm(
    (accepted) => accepted && dispatch(importFromMapgenieAccountAsync())
  );

  const { state: clearMapConfirmState, open: openClearMapConfirm } = useConfirm(
    (accepted) => accepted && dispatch(clearMapDataAsync())
  );

  const { state: clearGameConfirmState, open: openClearGameConfirm } =
    useConfirm((accepted) => accepted && dispatch(clearGameDataAsync()));

  React.useEffect(() => {
    dispatch(fetchLoggedInStatusAsync());
    dispatch(fetchPageTypeAsync());
  }, []);

  const onOpenDataManager = () => {
    dispatch(openDataManagerAsync());
  };

  return (
    <Loading loading={busy} overlay spinnerSize="2rem">
      <Confirm
        message="Import data from your Mapgenie account? This will overwrite your current game data."
        {...importFromAccountConfirmState}
      />
      <Confirm
        message="Clear all locations for the current map? This action cannot be undone."
        {...clearMapConfirmState}
      />
      <Confirm
        message="Clear all data for the current game? This action cannot be undone."
        {...clearGameConfirmState}
      />
      <div className={style.data}>
        <Button className={style.btn} onClick={onOpenDataManager}>
          <FontIcon icon="open-new-tab" className={style.icon} />
          <span>Open data manager</span>
        </Button>
        <Button
          className={style.btn}
          disabled={!importFromAccountEnabled}
          onClick={openImportFromAccountConfirm}
        >
          <FontIcon icon="person-import" className={style.icon} />
          <span>Import from Mapgenie account</span>
        </Button>
        <Button
          className={style.btn}
          id={style.clearGame}
          disabled={!clearGameEnabled}
          onClick={openClearGameConfirm}
        >
          <FontIcon icon="trash" className={style.icon} />
          <span>Clear current game</span>
        </Button>
        <Button
          className={style.btn}
          id={style.clearMap}
          disabled={!clearMapEnabled}
          onClick={openClearMapConfirm}
        >
          <FontIcon icon="trash" className={style.icon} />
          <span>Clear current map</span>
        </Button>
      </div>
    </Loading>
  );
};

namespace Data {
  export interface Props {}
}
