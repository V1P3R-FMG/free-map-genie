import { CustomSetting, type StorageEntry } from "../customSetting";

export class RememberFoundLocationsShownSetting extends CustomSetting {
  public readonly label = "Remember Found Locations Shown";

  private setting!: StorageEntry<boolean>;

  public get enabled() {
    return this.setting.value !== null;
  }

  private interceptSetFoundLocationsShown() {
    const _setFoundLocationsShown = window.mapManager!.setFoundLocationsShown;
    window.mapManager!.setFoundLocationsShown = (shown: boolean) => {
      _setFoundLocationsShown.call(window.mapManager, shown);

      if (this.enabled) {
        this.setting.value = shown;
      }
    };
  }

  public async load() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      window.mapManager?.setFoundLocationsShown(storedValue);
      $("#toggle-found").toggleClass("disabled", !storedValue);
    }
  }

  public async init() {
    const gameId = await this.waitForGameId();

    this.setting = this.StorageEntry.get<boolean>(
      ["game", gameId],
      "found_locations_shown"
    );

    await this.waitForMapManager();
    this.interceptSetFoundLocationsShown();

    await this.waitForMapLoaded();
  }

  protected enable(): void {
    this.setting.value = window.mapManager?.showFoundLocations ?? false;
  }

  protected disable(): void {
    this.setting.value = null;
  }
}
