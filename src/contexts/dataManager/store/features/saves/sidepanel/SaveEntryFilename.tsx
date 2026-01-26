import style from "./SaveEntryFilename.module.scss";

export const SaveEntryFilename = ({ filename }: SaveEntryFilename.Props) => {
  return <span className={style.filename}>{filename}</span>;
};

namespace SaveEntryFilename {
  export interface Props {
    filename: string;
  }
}
