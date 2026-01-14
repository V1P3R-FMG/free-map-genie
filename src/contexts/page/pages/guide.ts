import { Page } from "./page";
import { Client } from "@/common/client";
import { createAsyncProxy, type AsyncProxy } from "@/common/asyncProxy";
import { activateBlockedMapgenieScript } from "@/common/mapgenie";
import { waitForProperty } from "@/common/object";
import { waitForElement } from "@/common/dom";

import * as async from "@/common/async";

export class GuidePage extends Page {
  private readonly isTarkovQuest17Page =
    window.location.pathname === "/tarkov/guides/quests-17";

  private _client?: AsyncProxy<Client>;
  private _userId?: number;

  private get client() {
    return (this._client ??= createAsyncProxy(() => this.createClient()));
  }

  private isExtendedState(state: any): state is MG.Guide.ExtendedState {
    return (
      state &&
      "foundLocationsByMap" in state &&
      "foundLocationsByCategory" in state &&
      "foundLocationsByRegion" in state
    );
  }

  private async loadUserData() {
    if (!window.user) {
      throw new Error("User or mapData is not available");
    }

    await this.client.migrate();
    const data = await this.client.getData();

    window.foundLocations = data.locations;
    window.user.locations = data.locations;

    const state = await this.waitForState();

    // Update state found locations
    state.foundLocations = data.locations;

    // Reset found locations by map/category/region if we have them
    // We later repopulate these in fixState
    if (this.isExtendedState(state)) {
      Object.values(state.foundLocationsByMap).forEach((locations) => {
        locations.length = 0;
      });

      Object.values(state.foundLocationsByCategory).forEach((locations) => {
        locations.length = 0;
      });

      Object.values(state.foundLocationsByRegion).forEach((locations) => {
        locations.length = 0;
      });
    }
  }

  private async waitForState() {
    await async.waitUntil(() => {
      try {
        return state !== undefined;
      } catch {
        return false;
      }
    });
    return state!;
  }

  private async createClient() {
    if (this.isTarkovQuest17Page) {
      return Client.forGame(20);
    }

    try {
      // Try to get the game ID from axios headers
      const axios = await waitForProperty(window, "axios");
      const gameId = axios!.defaults.headers.common["X-Game-ID"];

      if (gameId) {
        return Client.forGame(Number(gameId));
      }
    } catch {}

    // Fallback to URL-based client
    return Client.forUrl(window.location.href);
  }

  private async getMapWindow() {
    const mapElement = await waitForElement<HTMLIFrameElement>(
      document,
      "#sticky-map iframe"
    );
    const mapWindow = await waitForProperty(mapElement, "contentWindow");
    await waitForProperty(mapWindow!, "mapData");
    return mapWindow;
  }

  private async setupUser() {
    const userId = await this.getUserId();

    // Client requires a user to object to function properly
    // So we create a dummy user
    window.user = {
      id: userId!,
      hasPro: false,
      locations: {},
      trackedCategoryIds: [],
      role: "user",
      suggestions: [],
    };

    // Mark user as pro to unlock all features in the guide
    window.isPro = true;
    window.user!.hasPro = true;
  }

  private async getUserId() {
    if (this._userId !== undefined) {
      return this._userId;
    }

    if (this.isTarkovQuest17Page) {
      await waitForProperty(window, "config");
      return window.user?.id;
    }

    const mapWindow = await this.getMapWindow();
    return mapWindow?.user?.id;
  }

  private fixCheckbox(checkbox: HTMLInputElement) {
    const $this = $(checkbox);

    const locationId = $this.data("location-id");

    if (!locationId) {
      logger.warn("Checkbox has no data-location-id attribute");
      return;
    }

    const isFound = window.foundLocations![locationId] ?? false;

    // Update the checkbox state
    $this.prop("checked", isFound);

    // Update the checklist item row state if applicable
    const $td = $this.parent();
    const $tr = $td?.parent();

    if ($tr && $tr.is(".checklist-item")) {
      $tr.toggleClass("found", isFound);
    }
  }

  private async fixState(checkbox: HTMLInputElement) {
    const $this = $(checkbox);
    const locationId = $this.data("location-id");
    const mapId = $this.data("map-id");
    const categoryId = $this.data("category-id");
    const regionId = $this.data("region-id");

    if (!locationId) {
      logger.warn("Checkbox has no data-location-id attribute");
      return;
    }

    const isFound = window.foundLocations![locationId] ?? false;
    if (!isFound) return;

    if (!this.isExtendedState(state)) {
      return;
    }

    state.foundLocationsByMap[mapId].push(locationId);
    state.foundLocationsByCategory[categoryId].push(locationId);

    if (regionId) {
      state.foundLocationsByRegion[regionId].push(locationId);
    }
  }

  private async fixCheckboxes() {
    // Make sure the guide script checkboxes are unchecked
    $<HTMLInputElement>(".check").each((_, checkbox) => {
      this.fixCheckbox(checkbox);
      this.fixState(checkbox);
    });
  }

  private updateCounts() {
    if (window.mapsById) {
      var mapIds = Object.keys(window.mapsById);
      for (var i = mapIds.length - 1; i >= 0; --i) {
        updateMapCount!(mapIds[i]);
      }
    }

    if (window.categoriesById) {
      var categoryIds = Object.keys(window.categoriesById);
      for (var i = categoryIds.length - 1; i >= 0; --i) {
        updateCategoryCount!(categoryIds[i]);
      }
    }

    if (window.regionsById) {
      var regionIds = Object.keys(window.regionsById);
      for (var i = regionIds.length - 1; i >= 0; --i) {
        updateRegionCount!(regionIds[i]);
      }
    }

    // Update overall found locations count
    // Ignore errors as function may not exist on some guides
    try {
      updateFoundLocationsCount?.();
    } catch {}
  }

  private markLocationFound(locationId: number, found: boolean) {
    const $checkbox = $<HTMLInputElement>(
      `.check[data-location-id="${locationId}"]`
    );

    if ($checkbox.length === 0) {
      logger.warn(
        `No checkbox found for location ID ${locationId} to update its state`
      );
      return;
    }

    $checkbox.prop("checked", found);

    // If the guide has its own markLocationFound function, use it
    if (markLocationFound) {
      markLocationFound({ target: $checkbox.get(0)! }, locationId, found);
    } else {
      // Otherwise, just update the state
      state!.foundLocations[locationId] = found;
    }
  }

  private async setupEventListeners() {
    if (this.isTarkovQuest17Page) {
      return;
    }

    const mapWindow = await this.getMapWindow();
    mapWindow?.addEventListener("locationMarked", (e) => {
      const { locationId, found } = e.detail;

      this.markLocationFound(locationId, found);
    });
  }

  public async start() {
    await this.setupUser();

    await this.client.storageRequestPersist();

    await this.loadUserData();
    await this.fixCheckboxes();
    this.updateCounts();

    // Setup event listeners from the map window
    await this.setupEventListeners();

    // Activate blocked Mapgenie scripts
    if (this.isTarkovQuest17Page) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }

    await this.client.installInterceptor();
  }

  public async canStart() {
    const userId = await this.getUserId();

    // We can only start if user is logged in
    if (userId === undefined) {
      logger.warn("User not logged in, FMG will not work");

      return false;
    }
    return true;
  }

  public async restore() {
    // Activate blocked Mapgenie scripts
    if (this.isTarkovQuest17Page) {
      await activateBlockedMapgenieScript("TarkovQuestToolWidget");
    }
  }
}
