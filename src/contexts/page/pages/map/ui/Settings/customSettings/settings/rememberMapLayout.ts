import { CustomSetting, type StorageEntry } from "../customSetting";

export class RememberMapTypeSettingData extends CustomSetting {
  public readonly label = "Remember Map Type";

  private setting!: StorageEntry<string>;

  public get enabled() {
    return this.setting.value !== null;
  }

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

  private getActiveMapType(): string {
    const active = $("#map-type-control .active").first();
    const title = active.attr("title");
    return title ?? "";
  }

  private setActiveMapType(title: string) {
    $("#map-type-control div").each((_, element) => {
      const $element = $(element);
      if ($element.attr("title") === title) {
        $element.trigger("click");
      }
    });
  }

  public async load() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      this.setActiveMapType(storedValue);
    }
  }

  public async init() {
    const gameId = await this.waitForGameId();

    this.setting = this.StorageEntry.get<string>(
      ["game", gameId],
      "remember_map_type"
    );

    await this.waitForMapManager();
    this.interceptMapTypeChanges();

    await this.waitForMapLoaded();
  }

  protected enable(): void {
    this.setting.value = this.getActiveMapType();
  }

  protected disable(): void {
    this.setting.value = null;
  }
}
