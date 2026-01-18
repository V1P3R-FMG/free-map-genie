import { createIsolatedElement } from "@webext-core/isolated-element";

import { MountableComponent } from "./react";
import { mount, type Parent, type MountPlace } from "./mount";

export type Css =
  | {
      url: string;
    }
  | {
      textContent: string;
    }
  | undefined;

export class IsolatedComponent<P extends {}> extends MountableComponent<P> {
  private parentElement?: HTMLElement;

  protected css(): Css | Promise<Css> {
    return undefined;
  }

  public async mount(parent?: Parent, place?: MountPlace) {
    const css = await this.css();

    const { isolatedElement, parentElement } = await createIsolatedElement({
      name: "div",
      mode: "open",
      css,
    });

    this.parentElement = parentElement;

    mount(parent, parentElement, place);

    super.mount(isolatedElement);
  }

  public unmount() {
    super.unmount();
    this.parentElement?.remove();
  }
}
