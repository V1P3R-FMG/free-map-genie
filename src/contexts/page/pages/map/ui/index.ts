import { TotalProgress } from "./components/TotalProgress";
import { Settings } from "./components/Settings";

export class UI {
  private readonly totalProgress = new TotalProgress();
  private readonly settings = new Settings();

  public async mount() {
    await this.totalProgress.mount();
    await this.settings.mount();
  }
}
