import { waitForProperty } from "@/common/object";
import { SettingData } from "./settingData";

export class RememberFoundLocationsShownSettingData extends SettingData {
  public readonly label = "Remember Found Locations Shown";

  private readonly setting = this.storage.get<boolean>(
    "remember_found_locations_shown"
  );

  private interceptSetFoundLocationsShown() {
    const _setFoundLocationsShown = window.mapManager!.setFoundLocationsShown;
    window.mapManager!.setFoundLocationsShown = (shown: boolean) => {
      _setFoundLocationsShown.call(window.mapManager, shown);

      if (this.enabled) {
        this.setting.value = shown;
      }
    };
  }

  private loadInitialValue() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      window.mapManager?.setFoundLocationsShown(storedValue);
      $("#toggle-found").toggleClass("disabled", !storedValue);
    }
  }

  private waitForMapManager() {
    return waitForProperty(window, "mapManager");
  }

  private async waitForMapLoad() {
    if (!window.mapManager!.map.loaded()) {
      return new Promise<void>((resolve) => {
        window.mapManager!.map.on("load", () => resolve());
      });
    }
  }

  protected init() {
    logger.debug("Initializing RememberFoundLocationsShownSettingData", this);
    this.waitForMapManager().then(async () => {
      this.interceptSetFoundLocationsShown();

      await this.waitForMapLoad();
      this.loadInitialValue();
    });

    return this.setting.value !== null;
  }

  public onChange(enabled: boolean) {
    super.onChange(enabled);
    if (enabled) {
      this.setting.value = window.mapManager?.showFoundLocations ?? false;
    } else {
      this.setting.value = null;
    }
  }
}
