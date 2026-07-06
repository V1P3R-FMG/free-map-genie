import clsx from "clsx";
import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import {
  selectAppConnected,
  reloadActiveTabAsync,
  updateConnectedStatusAsync,
} from "../appSlice";

import { FontIcon } from "@/components/FontIcon";

import style from "./Connection.module.scss";

export const Connection = () => {
  const disptach = useAppDispatch();

  const connected = useAppSelector(selectAppConnected);

  async function reloadActiveTab() {
    disptach(reloadActiveTabAsync());
  }

  React.useEffect(() => {
    disptach(updateConnectedStatusAsync());
  }, []);

  return (
    <span className={clsx(style.connection, { [style.connected]: connected })}>
      {connected ? (
        <>connected</>
      ) : (
        <>
          <FontIcon icon="reload" size="0.8rem" onClick={reloadActiveTab} />
          disconnected
        </>
      )}
    </span>
  );
};
