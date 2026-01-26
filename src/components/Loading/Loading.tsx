import { Spinner } from "../Spinner";
import style from "./Loading.module.scss";

export const Loading = ({
  id,
  className,
  loading,
  children,
  spinnerSize,
  overlay,
}: Loading.Props) => {
  return (
    <div
      id={id}
      className={clsx(style.loading, className, { [style.overlay]: overlay })}
    >
      <div className={clsx(style.spinnerContainer, { [style.show]: loading })}>
        <Spinner size={spinnerSize} />
      </div>
      <div className={clsx(style.loadingContent, { [style.show]: !loading })}>
        {children}
      </div>
    </div>
  );
};

export namespace Loading {
  export interface Props extends React.PropsWithChildren {
    id?: string;
    className?: string;
    loading: boolean;
    spinnerSize?: string | number;
    overlay?: boolean;
  }
}
