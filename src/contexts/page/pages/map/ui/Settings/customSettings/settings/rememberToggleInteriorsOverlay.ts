import { CustomSetting, type StorageEntry } from "../customSetting";

export class RememberToggleInteriorsOverlaySetting extends CustomSetting {
  public readonly label = "Remember Interiors Overlay";

  private setting!: StorageEntry<boolean>;

  public get enabled() {
    return this.setting.value !== null;
  }

  public get applicable(): boolean {
    return $("#toggle-image-overlays").length > 0;
  }

  private interceptToggleImageOverlays() {
    const _setImageOverlaysVisible = window.mapManager!.setImageOverlaysVisible;
    window.mapManager!.setImageOverlaysVisible = (visible: boolean) => {
      _setImageOverlaysVisible.call(window.mapManager, visible);

      if (this.enabled) {
        this.setting.value = !visible;
      }
    };
  }

  private isInteriorsDisabled(): boolean {
    return $("#toggle-image-overlays").hasClass("disabled");
  }

  private setInteriorsOverlayActive(active: boolean) {
    $("#toggle-image-overlays").toggleClass("disabled", !active);
    window.mapManager!.setImageOverlaysVisible(active);
  }

  public async load() {
    const storedValue = this.setting.value;
    if (storedValue !== null) {
      this.setInteriorsOverlayActive(!storedValue);
    }
  }

  public async init() {
    const gameId = await this.waitForGameId();

    this.setting = this.StorageEntry.get<boolean>(
      ["game", gameId],
      "interiors_overlay_disabled"
    );

    await this.waitForMapManager();
    this.interceptToggleImageOverlays();

    await this.waitForMapLoaded();
  }

  protected enable(): void {
    this.setting.value = this.isInteriorsDisabled();
  }

  protected disable(): void {
    this.setting.value = null;
  }
}
