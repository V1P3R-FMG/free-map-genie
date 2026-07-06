import style from "./Info.module.scss";

const isRed = (name: string, value: any) => {
  switch (name) {
    case "state":
      return value === "crashed";
    case "userId":
      return value === null || value === "not logged in";
    default:
      return false;
  }
};

const isGreen = (name: string, value: any) => {
  switch (name) {
    case "state":
      return value === "running";
    default:
      return false;
  }
};

export const Entry = ({ name, value }: Entry.Props) => {
  const green = isGreen(name, value);
  const red = isRed(name, value);

  return (
    <div className={style.entry}>
      <strong>{name}</strong>
      <span
        style={{
          color: green ? "var(--green)" : red ? "var(--red)  " : undefined,
        }}
      >
        {String(value)}
      </span>
    </div>
  );
};

export namespace Entry {
  export interface Props {
    name: string;
    value: any;
  }
}
