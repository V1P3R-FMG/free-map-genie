import { useAppDispatch } from "@/contexts/dataManager/hooks";
import { AsyncThunk } from "@reduxjs/toolkit";
import { Button } from "@/components/Button";

import style from "./Data.module.scss";

import type { FmgIconsId } from "@/common/icons";

export const DataAction = ({
  message,
  text,
  action,
  type,
  disabled,
  icon,
}: DataAction.Props) => {
  const dispatch = useAppDispatch();

  const { state, open } = useConfirm(
    (accepted) => accepted && dispatch(action())
  );

  return (
    <>
      <Confirm message={message} {...state} />
      <Button
        className={style.btn}
        type={type}
        disabled={disabled}
        onClick={open}
      >
        <FontIcon icon={icon} className={style.icon} />
        <span>{text}</span>
      </Button>
    </>
  );
};

namespace DataAction {
  export interface Props {
    message: string;
    text: string;
    icon: FmgIconsId;
    action: AsyncThunk<void, void, any>;
    type?: Button.Props["type"];
    disabled?: boolean;
  }
}
