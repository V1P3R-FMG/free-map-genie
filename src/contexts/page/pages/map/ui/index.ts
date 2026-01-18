import { waitForProperty } from "@/common/object";

import { TotalProgress } from "./TotalProgress";

export class UI {
  private readonly totalProgress = new TotalProgress();

  public async mount() {
    this.totalProgress.mount();

    const store = await waitForProperty(window, "store");

    store!.subscribe(() => this.update());

    this.update();
  }

  private update() {
    if (!window.store) {
      logger.warn("Store not defined yet, skipping ui update.");
      return;
    }

    const state = window.store.getState();

    this.totalProgress.updateFromState(state);
  }
}
