import { waitForProperty } from "@/common/object";

import { TotalProgress } from "./TotalProgress";
import { Settings, SettingsManager, settingsData } from "./Settings";

export class UI {
  private readonly settingsManager = new SettingsManager();

  private readonly totalProgress = new TotalProgress();
  private readonly settings = new Settings({
    settingsManager: this.settingsManager,
  });

  constructor() {
    this.settingsManager.register(
      settingsData.RememberFoundLocationsShownSettingData
    );
  }

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
