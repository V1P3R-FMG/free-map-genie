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

  private async setupUser() {
    if (!window.user) return;

    // Add real user to the backend profiles list
    await this.client.addUserProfile(window.user.id);

    // Get the active user from the backend
    const activeProfileId = await this.client.getActiveProfileId();

    // Update the user
    window.user.realId = window.user.id;
    window.user.id = activeProfileId ?? window.user.id;

    window.user!.hasPro = true;

    window.mapData!.maxMarkedLocations = Infinity;
  }

  private async loadUserData() {
    await this.client.migrate();
    const data = await this.client.getData();

    const locationsById = Object.fromEntries(
      window.mapData!.locations.map((loc) => [loc.id, loc])
    );

    const filteredLocations = Object.fromEntries(
      Object.keys(data.locations)
        .filter((id) => !!locationsById[id])
        .map((id) => [id, true])
    );

    const filteredNotes = data.notes.filter(
      (note) => note.map_id === window.mapData!.map.id
    );

    window.user!.locations = filteredLocations;
    window.user!.trackedCategoryIds = data.trackedCategoryIds;

    window.mapData!.notes = filteredNotes;
    window.mapData!.presets = data.presets;
  }

  private async unlockMapLinks() {
    await fixMapLinks(this.client.mapgenie);
  }

  @LazyGetter()
  private get fmgMapId() {
    const urlParams = new URLSearchParams(window.location.search);
    const mapIdParmam = urlParams.get("fmgMapId") ?? undefined;
    return mapIdParmam ? Number(mapIdParmam) : null;
  }

  private hasProCategoryLocations() {
    const proCategoryLocationCounts = window.mapData!.proCategoryLocationCounts;
    for (const key in proCategoryLocationCounts) {
      const count = proCategoryLocationCounts[key];
      if (count > 0) return true;
    }
    return false;
  }

  private async loadMapDataForMapId(mapId: number) {
    const game = await this.client.mapgenie.fetchGame(window.game!.id);
    const map = game.maps.find((m) => m.id === mapId);

    if (!map) {
      logger.warn(`Map with ID ${mapId} not found in game ${game.title}`);
      return;
    }

    mapDataUtils.loadMapData(map);
  }

  private async loadMapData() {
    if (this.fmgMapId !== null) {
      await this.loadMapDataForMapId(this.fmgMapId);
      return;
    }

    if (this.hasProCategoryLocations()) {
      await this.loadMapDataForMapId(window.mapData!.map.id);
    }
  }

  private async loadHeatmaps() {
    const hasHeatmaps = window.mapData!.heatmapGroups.length > 0;
    if (!hasHeatmaps) return;

    const heatmaps = await this.client.mapgenie.fetchHeatmaps(
      window.mapData!.map.id
    );

    mapDataUtils.loadHeatmaps(heatmaps);
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

  public async start() {
    await waitForProperty(window, "mapData");

    await this.setupUser();

    // Load map data and heatmaps for pro maps and maps with heatmaps
    await this.loadMapData();
    await this.loadHeatmaps();

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
      await activateBlockedMapgenieScript("map");
      return;
    }

    // Request persistend storage
    await this.client.storageRequestPersist();

    // Login client from map data
    this.client.loginFromMap();

    // Load user data
    await this.loadUserData();

    await activateBlockedMapgenieScript("map");

    this.setupEventListeners();
    await this.client.installInterceptor();
    await this.ui.mount();

    // Restore fmgMapId param on pro maps
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
