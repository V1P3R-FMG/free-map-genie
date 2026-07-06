import { MountableComponent } from "./react";
import { mount, type Parent, type MountPlace } from "./mount";
import { CssHelper, type Css } from "./css";
import { nanoid } from "nanoid";

export class IntegratedComponent<P extends {}> extends MountableComponent<P> {
  private readonly id: string = nanoid();

  private parentElement?: HTMLElement;

  protected css(): Css | Promise<Css> {
    return undefined;
  }

  private mountDocumentCss(css?: string) {
    if (
      css &&
      !document.querySelector(
        `style[fmg-integrated-document-styles="${this.id}"]`
      )
    ) {
      const style = document.createElement("style");
      style.textContent = css;
      style.setAttribute("fmg-integrated-document-styles", this.id);
      (document.head ?? document.documentElement).append(style);
    }
  }

  public async mount(parent?: Parent, place?: MountPlace) {
    const css = await this.css();
    const { documentCss } = await CssHelper.processCss(css);

    const parentElement = document.createElement("div");

    this.mountDocumentCss(documentCss);

    this.parentElement = parentElement;

    mount(parent, parentElement, place);

    super.mount(parentElement);
  }

  public unmount() {
    super.unmount();
    this.parentElement?.remove();
  }
}
