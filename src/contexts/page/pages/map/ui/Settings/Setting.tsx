export const Setting = (props: Setting.Props) => {
  const [checked, setChecked] = useState(props.enabled);

  const onClick = () => {
    setChecked(!checked);
    props.onChange?.(!checked);
  };

  return (
    <div className="checkbox-wrapper" onClick={onClick}>
      <div className="custom-checkbox settings-checkbox">
        <input
          type="checkbox"
          className="custom-control-input"
          checked={checked}
          readOnly
        />
        <label className="custom-control-label">{props.label}</label>
      </div>
    </div>
  );
};

namespace Setting {
  export interface Props {
    label: string;
    enabled: boolean;
    onChange?: (value: any) => void;
  }
}
