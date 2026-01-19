import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectAppEnabled,
  fetchIsAppEnabledAsync,
  setIsAppEnabledAsync,
} from "../appSlice";

import { FontIcon } from "@/components/FontIcon";

import style from "./Header.module.scss";

export const Header = () => {
  const dispatch = useAppDispatch();
  const enabled = useAppSelector(selectAppEnabled);

  React.useEffect(() => {
    dispatch(fetchIsAppEnabledAsync());
  });

  const reload = () => {
    browser.runtime.reload();
  };

  const openLogoLink = async (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      await browser.tabs.create({ url: "https://mapgenie.io" });
      window.close();
    } else if (e.button === 0) {
      await browser.tabs.update({ url: "https://mapgenie.io" });
      window.close();
    }
  };

  const close = () => {
    window.close();
  };

  const toggle = () => {
    dispatch(setIsAppEnabledAsync(!enabled));
  };

  return (
    <div className={style.header}>
      <div className={style.left}>
        <FontIcon
          className={clsx(style.power, { [style.on]: enabled })}
          size="1.2rem"
          icon="power"
          onClick={toggle}
          title="turn the extension on/off"
        />
        <FontIcon
          className={style.btn}
          size="1.2rem"
          icon="reload"
          onClick={reload}
          title="reload the extension"
        />
        <FontIcon
          className={style.btn}
          size="1.2rem"
          icon="g"
          onClick={openLogoLink}
          auxClick={openLogoLink}
          title="open mapgenio.io"
        />
      </div>
      <div className={style.center}>
        <div className={style.title}>
          <span className={style.bold}>Map</span>
          <span className={style.light}>Genie</span>
          <sup className={style.pro}>PRO</sup>
        </div>
      </div>
      <div className={style.right}>
        <FontIcon
          className={style.btn}
          size="1.2rem"
          icon="cross"
          onClick={close}
          title="close popup"
        />
      </div>
    </div>
  );
};
