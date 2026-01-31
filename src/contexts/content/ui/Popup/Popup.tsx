import { IsolatedComponent } from "@/common/ui";
import isMobile from "is-mobile";

import "./Popup.css";
import style from "./Popup.module.scss";
import { createPortal } from "react-dom";

export namespace Popup {
  export interface Props {
    open: boolean;
    hidden?: boolean;
    height?: string;
  }
}

export class Popup extends IsolatedComponent<Popup.Props> {
  private readonly _onDocumentClick = (e: MouseEvent) =>
    this.onDocumentClick(e);
  private readonly _onMessage = (e: MessageEvent) => this.onMessage(e);

  constructor(props?: Popup.Props) {
    super({ open: false, hidden: true, ...props });
  }

  public async css() {
    return {
      url: [
        await BrowserUtils.getCssUrl(),
        browser.runtime.getURL("/assets/fmg-icons.css"),
      ],
    };
  }

  private get logo() {
    return browser.runtime.getURL("logo.svg");
  }

  private isMobile() {
    return isMobile({
      featureDetect: true,
      tablet: true,
    });
  }

  private isMini() {
    if (window.isMini) return true;
    const params = new URLSearchParams(window.location.search);
    return params.get("mini") === "true";
  }

  public open() {
    return this.update({ open: true });
  }

  public close() {
    return this.update({ open: false });
  }

  private onDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!this.props.open) return;

    if (
      !target.querySelector(`.${style.popup}`) &&
      !target.querySelector(`.${style.popupButton}`)
    ) {
      this.close();
    }
  }

  private onMessage(e: MessageEvent) {
    if (typeof e.data !== "object" || e.data === null) return;

    switch (e.data.type) {
      case "popup-mounted":
        this.update({ height: e.data.height + "px" });
        break;
    }
  }

  private onTransitionEnd(e: React.TransitionEvent) {
    logger.debug("Popup transition ended.", {
      event: e,
      props: { ...this.props },
    });
    if (!this.props.open && !this.props.hidden) {
      this.update({ hidden: true });
    }
  }

  protected onMounted() {
    document.addEventListener("click", this._onDocumentClick);
    window.addEventListener("message", this._onMessage);
  }

  protected onUnmounted() {
    document.removeEventListener("click", this._onDocumentClick);
    window.removeEventListener("message", this._onMessage);
  }

  public render() {
    if (!this.isMobile() || this.isMini()) {
      return null;
    }

    const onClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      this.open();
    };

    return (
      <>
        <button className={style.popupButton} onClick={onClick}>
          <img className={style.icon} src={this.logo} alt="FMG" />
        </button>
        {this.renderPopup()}
      </>
    );
  }

  private renderPopup() {
    return createPortal(
      <iframe
        onTransitionEnd={(e) => this.onTransitionEnd(e)}
        style={this.props.height ? { height: this.props.height } : undefined}
        className={clsx(style.popup, { [style.open]: this.props.open })}
        src={
          this.props.hidden ? undefined : browser.runtime.getURL("popup.html")
        }
        allowFullScreen={true}
      />,
      document.body
    );
  }

  public update(props: Partial<Popup.Props>) {
    const hidden = props.open ? false : (props.hidden ?? this.props.hidden);
    super.update({ ...props, hidden });
  }
}
