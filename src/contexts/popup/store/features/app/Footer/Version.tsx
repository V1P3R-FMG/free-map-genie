import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectAppVersion,
  selectAppLatestVersion,
  selectAppNeedsUpdate,
  fetchLatestVersionAsync,
} from "../appSlice";

import { FontIcon } from "@/components/FontIcon";

import style from "./Version.module.scss";

export const Version = () => {
  const dispatch = useAppDispatch();

  const version = useAppSelector(selectAppVersion);
  const latest = useAppSelector(selectAppLatestVersion);
  const needsUpdate = useAppSelector(selectAppNeedsUpdate);

  const onVersionClick = () => {
    logger.debug("Version click");
  };

  React.useEffect(() => {
    dispatch(fetchLatestVersionAsync());
  }, []);

  return (
    <div className={style.version}>
      {needsUpdate ? (
        <span
          className={style.warning}
          data-message={`New version available ${latest}`}
          onClick={onVersionClick}
        >
          <FontIcon icon="attention" size="0.8rem" />
        </span>
      ) : undefined}
      <span>v{version}</span>
    </div>
  );
};
