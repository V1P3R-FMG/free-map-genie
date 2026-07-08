import { TotalProgress } from "./components/totalprogress";
import { Settings } from "./components/settings";

export class UI {
  private readonly totalProgress = new TotalProgress();
  private readonly settings = new Settings();

  public async mount() {
    await this.totalProgress.mount();
    await this.settings.mount();
  }
}
