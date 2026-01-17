import { Spinner } from "@/components/Spinner";

import style from "./Overlay.module.scss";

export const Overlay = ({ message }: Overlay.Props) => {
  React.useEffect(() => {
    if (window.isMini) return;

    const { overflow, paddingRight } = document.body.style;

    const offsetWidth = window.innerWidth;

    // Get current computed padding right in pixels
    const currentPaddingRight =
      parseInt(window.getComputedStyle(document.body).paddingRight, 10) || 0;

    const scrollbarWidth = offsetWidth - document.body.scrollWidth;
    document.body.style.paddingRight = `${scrollbarWidth + currentPaddingRight}px`;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  const top = document.documentElement.scrollTop;

  if (window.isMini) {
    return null;
  }

  return (
    <div className={style.loading} style={{ top: `${top}px` }}>
      <div className={style.loadingContent}>
        <h1>{message}</h1>
        <Spinner size="5rem" />
      </div>
    </div>
  );
};

export namespace Overlay {
  export interface Props {
    message: string;
  }
}
