import { useAppDispatch } from "@/contexts/dataManager/hooks";
import { readSaves } from "../savesSlice";

import style from "./Import.module.scss";

export const Import = () => {
  const dispatch = useAppDispatch();

  const inputRef = React.useRef<HTMLInputElement>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(readSaves(e.target.files));

    //@ts-expect-error
    e.target.value = null;
  };

  return (
    <div className={style.importContainer}>
      <FileInput
        id={style.import}
        accept="application/json"
        onChange={onChange}
        multiple
        ref={inputRef}
      />
    </div>
  );
};
