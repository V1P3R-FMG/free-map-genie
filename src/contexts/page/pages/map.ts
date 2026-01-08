import { Page } from "./page";
import { Client } from "@/common/client";
import {
  activateBlockedMapgenieScript,
  makeUserPro,
  removeLocationsLimit,
} from "@/common/mapgenie";

export class MapPage extends Page {
  private _client?: Client;

  private async loadUserData() {
    if (!window.user || !window.mapData) {
      throw new Error("User or mapData is not available");
    }

    const data = await this.client.getData();

    window.user.locations = data.locations;
    window.user.trackedCategoryIds = data.trackedCategoryIds;

    window.mapData.notes = data.notes;
    window.mapData.presets = data.presets;
  }

  private get client() {
    return (this._client ??= Client.forMap());
  }

  public async start() {
    await this.client.storageRequestPersist();

    makeUserPro();
    removeLocationsLimit();

    await this.loadUserData();

    await activateBlockedMapgenieScript("map");
    await this.client.installInterceptor();
  }

  public async canStart() {
    // We can only start if user and mapData are present
    if (!window.user || !window.mapData) {
      await activateBlockedMapgenieScript("map");

      logger.warn("User not logged in, FMG will not work");

      return false;
    }
    return true;
  }
}
