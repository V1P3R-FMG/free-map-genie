import { useAppSelector, useAppDispatch } from "./hooks";
import {
  fetchGamesAsync,
  injectIconFontAsync,
  selectAppLoading,
} from "./store/features/app/appSlice";
import {
  importSelectedSave,
  selectCurrentSave,
} from "./store/features/saves/savesSlice";
import { SidePanel } from "./store/features/saves/sidepanel/SidePanel";
import { SaveView } from "./store/features/saves/view/SaveView";

import style from "./App.module.scss";

function App() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectAppLoading);
  const save = useAppSelector(selectCurrentSave);
  const [sidePanelOpen, setSidePanelOpen] = React.useState(false);

  React.useEffect(() => {
    dispatch(injectIconFontAsync());
    dispatch(fetchGamesAsync());
  }, []);

  const { state: confirmState, open: openConfirm } = useConfirm(
    (accepted) => accepted && dispatch(importSelectedSave())
  );

  return (
    <ThemeProvider theme="dark">
      <Confirm
        message="Import selected games? This will overwrite all data for all selected games."
        {...confirmState}
      />
      <Loading loading={loading} spinnerSize="2rem" overlay>
        <div className={style.app}>
          <div className={style.panels}>
            <div
              className={clsx(
                style.panel,
                style.sidePanelContainer,
                !sidePanelOpen && style.sidePanelCollapsed
              )}
            >
              <SidePanel />
            </div>
            <Button
              className={clsx(
                style.sidePanelToggle,
                sidePanelOpen
                  ? style.sidePanelToggleOpen
                  : style.sidePanelToggleClosed
              )}
              type="normal"
              onClick={() => setSidePanelOpen((open) => !open)}
            >
              <FontIcon icon={sidePanelOpen ? "caret-left" : "caret-right"} />
            </Button>
            <div className={clsx(style.panel, style.content)}>
              <div className={style.view}>
                <SaveView />
              </div>
              <div className={style.bottomBar}>
                <Button
                  className={style.iconBtn}
                  type="confirm"
                  disabled={!save}
                  onClick={openConfirm}
                >
                  <FontIcon icon="upload" />
                  <span>Import</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Loading>
    </ThemeProvider>
  );
}

export default App;
