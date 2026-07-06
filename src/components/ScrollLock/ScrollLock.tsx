import { useScrollLock, useIsomorphicLayoutEffect } from "usehooks-ts";

export const ScrollLock = ({
  lockTarget,
  locked,
  widthReflow,
}: ScrollLock.Props) => {
  const { lock, unlock } = useScrollLock({
    autoLock: false,
    lockTarget,
    widthReflow,
  });

  React.useEffect(() => {
    if (locked) lock();
    else unlock();
  }, [locked, lockTarget]);

  return null;
};

namespace ScrollLock {
  export interface Props {
    lockTarget?: string | HTMLElement;
    locked?: boolean;
    widthReflow?: boolean;
  }
}
