import style from "./VersionBadge.module.scss";

const colors: Record<number, string> = {
  1: "#e69113",
  2: "#048eff",
  3: "#9959ff",
};

export const VersionBadge = ({ version }: VersionBadge.Props) => {
  const color = version ? colors[version] : "#ff371d";

  if (version === null) {
    const elementStyle: React.CSSProperties = {
      backgroundColor: "#5e1212",
    };

    return (
      <div className={style.versionBadge} style={elementStyle}>
        <FontIcon className={style.warn} icon="warn" size="0.8rem" />
      </div>
    );
  }

  const elementStyle: React.CSSProperties = {
    backgroundColor: color,
  };

  return (
    <div className={clsx(style.versionBadge)} style={elementStyle}>
      v{version}
    </div>
  );
};

namespace VersionBadge {
  export interface Props {
    version: number | null;
  }
}
