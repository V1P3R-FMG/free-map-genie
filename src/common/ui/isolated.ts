import { createIsolatedElement } from "@webext-core/isolated-element";
import { nanoid } from "nanoid";

import { MountableComponent } from "./react";
import { mount, type Parent, type MountPlace } from "./mount";
import { CssHelper, type Css } from "./css";

export class IsolatedComponent<P extends {}> extends MountableComponent<P> {
  private readonly id: string = nanoid();

  private parentElement?: HTMLElement;

  protected css(): Css | Promise<Css> {
    return undefined;
  }

  private injectDocumentCss(css?: string) {
    if (
      css &&
      !document.querySelector(
        `style[fmg-shadow-root-document-styles="${this.id}"]`
      )
    ) {
      const style = document.createElement("style");
      style.textContent = css;
      style.setAttribute("fmg-shadow-root-document-styles", this.id);
      (document.head ?? document.documentElement).append(style);
    }
  }

  public async mount(parent?: Parent, place?: MountPlace) {
    const css = await this.css();
    const { documentCss, shadowCss } = await CssHelper.processCss(css, true);

    const { isolatedElement, parentElement } = await createIsolatedElement({
      name: "div",
      mode: "open",
      css: { textContent: shadowCss },
    });

    this.injectDocumentCss(documentCss);

    this.parentElement = parentElement;

    mount(parent, parentElement, place);

    super.mount(isolatedElement);
  }

  public unmount() {
    super.unmount();
    this.parentElement?.remove();
  }
}
