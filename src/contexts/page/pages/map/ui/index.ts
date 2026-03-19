import { waitForProperty } from "@/common/object";

import { TotalProgress } from "./TotalProgress";
import { Settings } from "./Settings";

export class UI {
  private readonly totalProgress = new TotalProgress();
  private readonly settings = new Settings();

  public async mount() {
    await this.totalProgress.mount();
    await this.settings.mount();

    const store = await waitForProperty(window, "store");

    store!.subscribe(() => this.update());

    this.update();
  }

  private update() {
    const state = window.store!.getState();

    this.totalProgress.updateFromState(state);
  }
}
