import { waitForProperty } from "@/common/object";
import { SettingData } from "./settingData";

export class RememberMapTypeSettingData extends SettingData {
  public readonly label = "Remember Map Type";

  private readonly setting = this.storage.get<string>("remember_map_type");

  private interceptMapTypeChanges() {
    $("#map-type-control div").on("click", (event) => {
      const title = $(event.currentTarget).attr("title");
      if (title) {
        if (this.enabled) {
          this.setting.value = title;
        }
      }
    });
  }

  private loadInitialValue() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      this.setMapType(storedValue);
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

  private setMapType(title: string) {
    $("#map-type-control div").each((_, element) => {
      const $element = $(element);
      if ($element.attr("title") === title) {
        $element.trigger("click");
      }
    });
  }

  protected init() {
    this.waitForMapManager().then(async () => {
      this.interceptMapTypeChanges();

      await this.waitForMapLoad();
      this.loadInitialValue();
    });

    return this.setting.value !== null;
  }

  public onChange(enabled: boolean) {
    super.onChange(enabled);
    if (enabled) {
      const active = $("#map-type-control .active").first();
      const title = active.attr("title");
      if (!title) {
        throw new Error("Active map type has no title");
      }
      this.setting.value = title;
    } else {
      this.setting.value = null;
    }
  }
}
