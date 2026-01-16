import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import { selectInfo, getInfoAsync } from "./infoSlice";

import { Entry } from "./Entry";

import style from "./Info.module.scss";

export const Info = ({}: Info.Props) => {
  const dispatch = useAppDispatch();
  const info = useAppSelector(selectInfo);

  React.useEffect(() => {
    dispatch(getInfoAsync());
  }, []);

  return (
    <div className={style.info}>
      {Object.entries(info).map(([key, value]) => (
        <Entry key={key} name={key} value={value} />
      ))}
    </div>
  );
};

export namespace Info {
  export interface Props {}
}
