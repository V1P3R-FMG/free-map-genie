import { Page } from "../page";
import { UI } from "./ui";

import { Client } from "@/common/client";
import { activateBlockedMapgenieScript } from "@/common/mapgenie";
import { mapDataUtils } from "@/common/mapgenie";
import { waitForProperty } from "@/common/object";

import { fixMapLinks } from "@/common/mapgenie";
import { LazyGetter } from "lazy-get-decorator";

export class MapPage extends Page {
  private client = new Client();
  private ui = new UI();

  private async withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    message: string
  ) {
    let handle: number | undefined;

    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      handle = window.setTimeout(
        () => reject(new Error(`${message} timed out after ${timeout}ms.`)),
        timeout
      );
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (handle !== undefined) {
        window.clearTimeout(handle);
      }
    }
  }

  private async setupUser() {
    const user = window.user;
    if (!user) return;

    user.realId = user.id;
    window.isPro = true;
    user.hasPro = true;

    window.mapData!.maxMarkedLocations = Infinity;

    try {
      const activeUserId = await this.withTimeout(
        this.client.getActiveUserId(),
        5000,
        "Active FMG profile lookup"
      );

      user.id = activeUserId ?? user.id;
    } catch (err) {
      logger.warn("Could not load active FMG profile before map boot.", err);
    }
  }

  private getTrackedCategoryIdsForCurrentMap(categoryIds: number[]) {
    const categories = window.mapData?.categories ?? {};
    const availableCategoryIds = new Set(
      Object.keys(categories).map((id) => Number(id))
    );

    const filteredCategoryIds = categoryIds.filter((id) =>
      availableCategoryIds.has(id)
    );

    if (filteredCategoryIds.length !== categoryIds.length) {
      const ignoredCategoryIds = categoryIds.filter(
        (id) => !availableCategoryIds.has(id)
      );
      logger.warn(
        "Ignoring tracked categories that are not available on the current map.",
        ignoredCategoryIds
      );
    }

    return filteredCategoryIds;
  }

  private filterTrackedCategoriesForCurrentMap() {
    if (!window.user) return;

    window.user.trackedCategoryIds = this.getTrackedCategoryIdsForCurrentMap(
      window.user.trackedCategoryIds ?? []
    );
  }

  private async loadUserData() {
    await this.client.migrate();
    const data = await this.client.getData();

    const pageLocations = window.mapData!.locations ?? [];
    const locationsById = Object.fromEntries(
      pageLocations.map((loc) => [loc.id, loc])
    );

    const filteredLocations =
      pageLocations.length > 0
        ? Object.fromEntries(
            Object.keys(data.locations)
              .filter((id) => !!locationsById[id])
              .map((id) => [id, true])
          )
        : data.locations;

    const filteredNotes = data.notes.filter(
      (note) => note.map_id === window.mapData!.map.id
    );

    window.user!.locations = filteredLocations;
    window.user!.trackedCategoryIds = this.getTrackedCategoryIdsForCurrentMap(
      data.trackedCategoryIds
    );

    window.mapData!.notes = filteredNotes;
    window.mapData!.presets = data.presets;

    logger.log(
      `Loaded ${Object.keys(filteredLocations).length} saved FMG locations.`
    );
  }

  private getSavedLocationIdsForCurrentMap() {
    const user = window.user;
    if (!user?.locations) return [];

    const pageLocationIds = new Set(
      (window.mapData?.locations ?? []).map((l) => l.id)
    );

    return Object.keys(user.locations)
      .filter((id) => pageLocationIds.has(Number(id)))
      .map(Number);
  }

  private async waitForMapObject(timeout = 5000) {
    await waitForProperty(window, "mapManager");

    const deadline = Date.now() + timeout;
    while (!window.mapManager?.map && Date.now() < deadline) {
      await new Promise((resolve) => window.setTimeout(resolve, 100));
    }

    return window.mapManager?.map ?? null;
  }

  private async waitForMapStyle(timeout = 5000) {
    const map = await this.waitForMapObject(timeout);
    if (!map) return;

    if (typeof map.loaded === "function" && map.loaded()) {
      return;
    }

    if (typeof map.on !== "function") {
      return;
    }

    await this.withTimeout(
      new Promise<void>((resolve) => {
        map.on("load", () => resolve());
        map.on("idle", () => resolve());
      }),
      timeout,
      "Waiting for MapGenie map style"
    ).catch((err) => {
      logger.warn("Map style event did not arrive before timeout.", err);
    });
  }

  private async updateFoundLocationsStyle() {
    try {
      window.mapManager?.updateFoundLocationsStyle();
      return;
    } catch (err) {
      logger.warn(
        "Could not update found location style immediately; retrying after map load.",
        err
      );
    }

    try {
      await this.waitForMapStyle();
      window.mapManager?.updateFoundLocationsStyle();
    } catch (err) {
      logger.warn("Could not update found location style after retry.", err);
    }
  }

  private async syncSavedLocationsToMap() {
    const store = window.store;
    if (!store) return;

    const locationIds = this.getSavedLocationIdsForCurrentMap();
    if (locationIds.length === 0) return;

    const state = store.getState();
    const foundLocations = state.user.foundLocations ?? {};
    const missingLocationIds = locationIds.filter(
      (id) => !foundLocations[id]
    );

    if (missingLocationIds.length > 0) {
      store.dispatch({
        type: "MG:USER:MARK_LOCATIONS",
        meta: {
          locationIds: missingLocationIds,
          found: true,
        },
      } as any);
    }

    await this.updateFoundLocationsStyle();

    logger.log(
      `Synced ${locationIds.length} saved FMG locations to the map` +
        ` (${missingLocationIds.length} newly marked).`
    );
  }

  private lockValue(obj: object, key: PropertyKey, value: unknown) {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: () => {},
    });
  }

  private lockProData() {
    if (window.user) {
      this.lockValue(window, "isPro", true);
      this.lockValue(window.user, "hasPro", true);
      this.lockValue(window.user, "locations", window.user.locations);
      this.lockValue(
        window.user,
        "trackedCategoryIds",
        window.user.trackedCategoryIds
      );
    }

    if (window.mapData) {
      this.lockValue(window.mapData, "maxMarkedLocations", Infinity);
      this.lockValue(window.mapData, "notes", window.mapData.notes);
      this.lockValue(window.mapData, "presets", window.mapData.presets);
    }
  }

  private async unlockMapLinks() {
    try {
      await fixMapLinks(this.client.mapgenie);
    } catch (err) {
      logger.error("Failed to unlock map links, loading map anyway.", err);
    }
  }

  @LazyGetter()
  private get fmgMapId() {
    const urlParams = new URLSearchParams(window.location.search);
    const mapIdParmam = urlParams.get("fmgMapId") ?? undefined;
    return mapIdParmam ? Number(mapIdParmam) : null;
  }

  private async loadMapDataForMapId(mapId: number) {
    const map = await this.client.mapgenie.fetchMap(mapId);
    mapDataUtils.loadMapData(map, {
      preserveMapConfig: mapId === window.mapData?.map.id,
      swapTileCoordinates: mapDataUtils.getStoredTileCoordinateSwap(
        map.game_id,
        map.id
      ),
    });
  }

  private async loadMapData() {
    if (!window.mapData) return;

    if (this.fmgMapId !== null) {
      await this.loadMapDataForMapId(this.fmgMapId);
    }
  }

  private async loadHeatmaps() {
    if (!window.mapData?.heatmapGroups) return;
    if (this.fmgMapId === null) return;

    const hasHeatmaps = window.mapData.heatmapGroups.length > 0;
    if (!hasHeatmaps) return;

    const heatmaps = await this.client.mapgenie.fetchHeatmaps(
      window.mapData!.map.id
    );

    mapDataUtils.loadHeatmaps(heatmaps);
  }

  private async loadRemoteMapData() {
    try {
      // If MapGenie's data API blocks a request, still boot the page's own map.
      await this.loadMapData();
      await this.loadHeatmaps();
    } catch (err) {
      logger.error("Failed to load pro map data, loading map anyway.", err);
    }
  }

  private setupEventListeners() {
    this.client.on("locationMarked", (e) => {
      // Forward to guide page
      window.dispatchEvent(
        new CustomEvent<Client.LocationEvent>("locationMarked", {
          detail: e.detail,
        })
      );
    });
  }

  private fixAltMapSdk() {
    if (window.config?.altMapSdk) {
      window.google = window.google || {};
      window.google.maps = window.google.maps || {
        Size: function () {},
      };
    }
  }

  private restoreFmgMapId() {
    if (this.fmgMapId !== null) {
      const params = new URLSearchParams();
      params.set("fmgMapId", this.fmgMapId.toString());

      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}?${params}`
      );
    }
  }

  private async login() {
    await waitForProperty(window, "mapManager");

    const $loginLink = $(`#user-panel a[href$="/login"]`);
    if ($loginLink.length > 0) {
      const href = $loginLink[0].getAttribute("href");
      if (href) {
        window.location.href = href;
      }
    } else {
      logger.warn("Login link not found.");
    }
  }

  private async activateMapScript() {
    if (window.mapManager) return;

    const activated = await activateBlockedMapgenieScript("map");
    if (!activated) {
      logger.warn("MapGenie map script not found.");
      return;
    }

    await waitForProperty(window, "mapManager", 30000);
  }

  private async installRequestInterceptor() {
    try {
      await this.withTimeout(
        this.client.installInterceptor(),
        10000,
        "FMG request interceptor installation"
      );
    } catch (err) {
      logger.error("Failed to install FMG request interceptor.", err);
    }
  }

  public async start() {
    await waitForProperty(window, "mapData");

    await this.setupUser();

    // Load map data and heatmaps for pro maps and maps with heatmaps
    await this.loadRemoteMapData();

    // MapGenie stores tracked categories per game. Only pass categories that
    // exist on this map or its map script may fail during initialization.
    this.filterTrackedCategoriesForCurrentMap();

    // Overwrite some game config options
    if (window.config) {
      window.config.proOnlyMedia = false;
      window.config.checklistEnabled = true;
      window.config.presetsEnabled = true;
      window.config.iconSizeToggleEnabled = true;
    }

    // Unlock pro map links
    await this.unlockMapLinks();

    if (!window.user) {
      await this.activateMapScript();

      // In development mode, auto-login and load map data to speed up testing
      if (import.meta.env.DEV) {
        await this.login();
      }

      return;
    }

    try {
      await this.withTimeout(
        (async () => {
          // Request persistend storage
          await this.client.storageRequestPersist();

          // Login client from map data
          this.client.loginFromMap();

          // Load user data
          await this.loadUserData();
        })(),
        5000,
        "FMG user data loading"
      );
    } catch (err) {
      logger.error("Failed to load FMG user data, loading map anyway.", err);
    }

    // Fix alt map sdk if needed
    this.fixAltMapSdk();

    this.lockProData();

    await this.activateMapScript();
    await this.installRequestInterceptor();
    await this.syncSavedLocationsToMap();

    this.setupEventListeners();
    await this.ui.mount();

    // Restore fmgMapId param on pro maps
    this.restoreFmgMapId();
  }

  public async info() {
    const userId = window.user?.id ?? "not logged in";
    const game = window.game?.title ?? null;
    const gameId = window.game?.id ?? null;
    const map = window.mapData?.map.title ?? null;
    const mapId = window.mapData?.map.id ?? null;

    return {
      userId,
      game,
      gameId,
      map,
      mapId,
    };
  }
}
