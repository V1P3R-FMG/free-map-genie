import style from "./Button.module.scss";

export const Button = ({
  id,
  className,
  ref,
  disabled,
  onClick,
  type = "normal",
  children,
}: Button.Props) => {
  return (
    <button
      className={clsx(style.btn, className)}
      id={id}
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      data-type={type}
    >
      {children}
    </button>
  );
};

export namespace Button {
  export interface Props extends React.PropsWithChildren {
    ref?: React.Ref<HTMLButtonElement>;
    id?: string;
    className?: string;
    disabled?: boolean;
    value?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: "normal" | "cancel" | "confirm";
  }
}
