import { ScrollLock } from "../ScrollLock";

import style from "./ScrollContainer.module.scss";

export const ScrollContainer = (props: ScrollContainer.Props) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <>
      <ScrollLock
        locked={ref.current ? props.locked : false}
        lockTarget={ref.current ?? undefined}
        widthReflow={props.widthReflow}
      />
      <div className={clsx(style.scrollContainer, props.className)} ref={ref}>
        {props.children}
      </div>
    </>
  );
};

namespace ScrollContainer {
  export interface Props extends React.PropsWithChildren {
    className?: string;
    locked?: boolean;
    widthReflow?: boolean;
  }
}
