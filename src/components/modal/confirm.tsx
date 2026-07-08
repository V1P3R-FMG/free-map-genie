import { Button } from "../button";
import { Panel } from "../panel";
import { Modal } from "./modal";

import style from "./confirm.module.scss";

export const Confirm = ({
  visible = false,
  message = "Are you sure?",
  acceptText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
}: Confirm.Props) => {
  return (
    <Modal show={visible}>
      <Panel className={style.confirmPanel}>
        <h3>{message}</h3>
        <div className={style.btnGroup}>
          <Button
            className={style.btn}
            type="normal"
            onClick={() => onConfirm && onConfirm(true)}
          >
            {acceptText}
          </Button>
          <Button
            className={style.btn}
            type="cancel"
            onClick={() => onConfirm && onConfirm(false)}
          >
            {cancelText}
          </Button>
        </div>
      </Panel>
    </Modal>
  );
};

namespace Confirm {
  export interface Props {
    visible?: boolean;
    message?: string;
    acceptText?: string;
    cancelText?: string;
    onConfirm?: (accepted: boolean) => void;
  }
}
