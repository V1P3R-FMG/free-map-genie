import { SettingData } from "./settingsData";
import { LocalStorageManager } from "./localStorageManager";

type SettingClass = new (storage: LocalStorageManager) => SettingData;

export class SettingsManager {
  private readonly storage = new LocalStorageManager();

  public readonly settings: SettingData[] = [];

  public register(...settings: SettingClass[]) {
    this.settings.push(...settings.map((Setting) => new Setting(this.storage)));
  }
}
