import { useAppSelector, useAppDispatch } from "@/contexts/popup/hooks";
import { selectInfo, selectInfoLoading, getInfoAsync } from "./infoSlice";

import { Entry } from "./Entry";

import style from "./Info.module.scss";
import { Loading } from "@/components/Loading";

export const Info = ({}: Info.Props) => {
  const dispatch = useAppDispatch();
  const info = useAppSelector(selectInfo);
  const loading = useAppSelector(selectInfoLoading);

  React.useEffect(() => {
    dispatch(getInfoAsync());
  }, []);

  return (
    <Loading loading={loading} spinnerSize={"2rem"}>
      <div className={style.info}>
        {Object.entries(info).map(([key, value]) => (
          <Entry key={key} name={key} value={value} />
        ))}
      </div>
    </Loading>
  );
};

export namespace Info {
  export interface Props {}
}
