import { TotalProgress } from "./TotalProgress";
import { Settings } from "./Settings";

export class UI {
  private readonly totalProgress = new TotalProgress();
  private readonly settings = new Settings();

  public async mount() {
    await this.totalProgress.mount();
    await this.settings.mount();
  }
}
