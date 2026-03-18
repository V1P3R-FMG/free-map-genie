import { LocalStorageManager } from "../localStorageManager";

export abstract class SettingData {
  public abstract readonly label: string;

  public constructor(protected readonly storage: LocalStorageManager) {}

  private _enabled: boolean | null = null;

  public get enabled() {
    if (this._enabled === null) {
      this._enabled = this.init();
    }
    return this._enabled ?? false;
  }

  protected abstract init(): boolean;

  public onChange(enabled: boolean) {
    this._enabled = enabled;
  }
}
