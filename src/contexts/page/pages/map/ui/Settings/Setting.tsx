import { CustomSetting } from "./customSettings";

import style from "./Setting.module.scss";

export const Setting = (props: Setting.Props) => {
  const [loading, setLoading] = React.useState(true);
  const [enabled, setEnabled] = useState(false);

  React.useEffect(() => {
    props.setting.onLoaded(() => {
      setEnabled(props.setting.enabled);
      setLoading(false);
    });
  });

  const onClick = () => {
    setEnabled((prev) => {
      const newValue = !prev;
      props.setting.onChange(newValue);
      return newValue;
    });
  };

  return (
    <div
      className={clsx(
        "checkbox-wrapper",
        style.setting,
        loading && style.skeleton
      )}
      onClick={onClick}
    >
      {loading && (
        <Loading
          className={style.spinner}
          loading={true}
          spinnerSize={"1rem"}
        />
      )}
      <div
        className={clsx(
          "custom-checkbox",
          "settings-checkbox",
          style.customCheckbox
        )}
      >
        <input
          type="checkbox"
          className="custom-control-input"
          checked={enabled}
          readOnly
        />
        <label className="custom-control-label">{props.setting.label}</label>
      </div>
    </div>
  );
};

namespace Setting {
  export interface Props {
    setting: CustomSetting;
  }
}
