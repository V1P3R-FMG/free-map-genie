import { FontIcon } from "../FontIcon";

import style from "./FileInput.module.scss";

export const FileInput = ({
  id,
  className,
  text,
  accept,
  multiple,
  ref,
  value,
  onChange,
}: FileInput.Props) => {
  const inputRef = ReactUtils.useMergeRefs(
    ref,
    React.useRef<HTMLInputElement>(null)
  );

  return (
    <div className={clsx(style.fileInput, className)} id={id}>
      <div className={style.dropArea}>
        <FontIcon icon="upload" size="2rem" />
        {text && <p>{text}</p>}
        <div className={style.divider}></div>
        <p>Drag & Drop {multiple ? "files" : "file"} here</p>
        <p className={style.small}>OR</p>
        <Button onClick={() => inputRef.current?.click()}>Browse File</Button>
        <input
          ref={inputRef}
          type="file"
          onChange={onChange}
          title=""
          accept={accept}
          multiple={multiple}
          value={value}
        />
      </div>
    </div>
  );
};

namespace FileInput {
  export interface Props {
    id?: string;
    className?: string;
    text?: string;
    accept?: string;
    multiple?: boolean;
    ref?: React.Ref<HTMLInputElement>;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
}
