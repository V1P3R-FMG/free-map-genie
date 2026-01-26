import style from "./Checkbox.module.scss";

export const Checkbox = ({
  checked,
  intermediate,
  onChange,
  className,
  id,
}: Checkbox.Props) => {
  const ref = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(intermediate);
    }
  }, [ref.current, intermediate]);

  return (
    <label className={clsx(style.checkbox, className)} id={id}>
      <input
        className={style.input}
        type="checkbox"
        ref={ref}
        checked={checked}
        onChange={onChange}
        readOnly={checked !== undefined && !onChange}
      />
      {checked ? (
        <FontIcon className={style.icon} icon="check" />
      ) : intermediate ? (
        <FontIcon className={style.icon} icon="dash" />
      ) : null}
    </label>
  );
};

namespace Checkbox {
  export interface Props {
    className?: string;
    id?: string;
    checked?: boolean;
    intermediate?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
}
