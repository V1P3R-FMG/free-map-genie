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

  private isMini() {
    if (window.isMini) {
      return true;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("mini")) {
      return true;
    }

    return false;
  }

  public render({ message }: LoadingOverlay.Props) {
    if (this.isMini()) {
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
