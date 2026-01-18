import { MountableComponent } from "./react";
import { mount, type Parent, type MountPlace } from "./mount";

export class IntegratedComponent<P extends {}> extends MountableComponent<P> {
  private parentElement?: HTMLElement;

  public mount(parent?: Parent, place?: MountPlace) {
    const parentElement = document.createElement("div");

    this.parentElement = parentElement;

    mount(parent, parentElement, place);

    super.mount(parentElement);
  }

  public unmount() {
    super.unmount();
    this.parentElement?.remove();
  }
}
