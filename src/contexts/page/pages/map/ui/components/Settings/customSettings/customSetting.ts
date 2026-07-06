import { waitForProperty } from "@/common/object";

import { StorageEntry } from "./storageEntry";

export { StorageEntry };

export abstract class CustomSetting {
  public abstract readonly label: string;

  public abstract get enabled(): boolean;

  private _loaded = false;
  private loadedCallbacks = new Set<() => void>();

  protected StorageEntry = StorageEntry;

  protected abstract enable(): void;
  protected abstract disable(): void;

  public abstract init(): Promise<void> | void;
  public abstract load(): Promise<void> | void;

  public constructor() {
    Promise.resolve()
      .then(() => this.init())
      .then(() => this.applicable && this.load())
      .then(() => {
        this._loaded = true;
        this.loadedCallbacks.forEach((callback) => callback());
        this.loadedCallbacks.clear();
      })
      .catch((error) => {
        console.error("Error initializing setting:", error);
      });
  }

  public get applicable(): boolean {
    return true;
  }

  public get loaded(): boolean {
    return this._loaded;
  }

  public onLoaded(callback: () => void): void {
    if (this._loaded) {
      callback();
    } else {
      this.loadedCallbacks.add(callback);
    }
  }

  public onChange(enabled: boolean) {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  protected async waitForMapManager() {
    return waitForProperty(window, "mapManager");
  }

  protected async waitForMapLoaded() {
    await this.waitForMapManager();

    if (!window.mapManager!.map.loaded()) {
      return new Promise<void>((resolve) => {
        window.mapManager!.map.on("load", () => resolve());
      });
    }
  }

  protected async waitForStore() {
    return waitForProperty(window, "store");
  }

  protected get store() {
    return window.store!;
  }

  protected getState() {
    return this.store.getState();
  }

  protected async waitForGameId() {
    await waitForProperty(window, "game");
    return window.game!.id;
  }
}
