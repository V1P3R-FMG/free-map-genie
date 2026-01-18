import { IsolatedComponent } from "@/common/ui";
import { Spinner } from "@/components/Spinner";

import { useScrollLock } from "./hooks";

import style from "./LoadingOverlay.module.scss";

const ScrollLock = () => {
  useScrollLock();
  return null as React.ReactNode;
};

export namespace LoadingOverlay {
  export interface Props {
    message: string;
  }
}

export class LoadingOverlay extends IsolatedComponent<LoadingOverlay.Props> {
  public async css() {
    return {
      url: await BrowserUtils.getCssUrl(),
    };
  }

  public render({ message }: LoadingOverlay.Props) {
    if (window.isMini) {
      return null;
    }

    const top = document.documentElement.scrollTop;

    return (
      <>
        <ScrollLock />
        <div className={style.loading} style={{ top: `${top}px` }}>
          <div className={style.loadingContent}>
            <h1>{message}</h1>
            <Spinner className={style.spinner} />
          </div>
        </div>
      </>
    );
  }
}
