import { Page } from "./page";
import { Client } from "@/common/client";
import { activateBlockedMapgenieScript } from "@/common/mapgenie";
import { mapDataUtils } from "@/common/mapgenie";
import { waitForProperty } from "@/common/object";

export class MapPage extends Page {
  private client = new Client();

  private _mapId?: number;

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

  private unlockMapSelector() {
    const links = $(".map-link")
      .toArray()
      .map((link) => {
        const $link = $(link);
        const isPro = $link.attr("href")?.endsWith("/upgrade") ?? false;
        return { $link, isPro };
      });

    if (links.length === 0) {
      logger.warn("No map links found to unlock map selector");
      return;
    }

    const proCount = links.filter(({ isPro }) => isPro).length;
    if (proCount === 0) {
      // No pro maps, nothing to unlock
      return;
    }

    const $firstFreeLink = links.find(
      ({ $link, isPro }) => !isPro && URL.canParse($link.attr("href") || "")
    )?.$link;
    if (!$firstFreeLink) {
      // How did we get on a map page with no free maps?
      logger.warn("No free map link found to unlock map selector");
      return;
    }

    const { origin, pathname } = new URL($firstFreeLink.attr("href")!);

    links.forEach(({ $link, isPro }) => {
      const name = $link
        .text()
        .replace(/\[(WIP|PRO)\]/, "")
        .trim();

      const map = window.mapData?.maps.find((m) => m.title.trim() === name);

      if (!map) {
        logger.warn(`Could not find map data for ${name}`);
        return;
      }

      if (this.fmgMapId !== undefined) {
        $link.toggleClass("selected", map.id === this.fmgMapId);
      }

      if (!isPro) return;

      $link.attr("href", `${origin}${pathname}?fmgMapId=${map.id}`);
      $link.attr("style", "");

      $link.removeAttr("target");
      $link.removeAttr("data-toggle");
      $link.removeAttr("title");
      $link.removeAttr("data-original-title");
    });
  }

  private get fmgMapId() {
    if (this._mapId === undefined) {
      const urlParams = new URLSearchParams(window.location.search);
      const mapIdParmam = urlParams.get("fmgMapId") ?? undefined;
      if (mapIdParmam) {
        this._mapId = Number(mapIdParmam);
      }
    }
    return this._mapId;
  }

  private async loadMapDataForMapId(mapId: number) {
    const game = await this.client.mapgenie.fetchGame(window.game!.id);
    const map = game.maps.find((m) => m.id === mapId);

    if (!map) {
      logger.warn(
        `Map with ID ${this.fmgMapId} not found in game ${game.title}`
      );
      return;
    }

    mapDataUtils.loadMapData(map);
  }

  private async loadMapData() {
    if (this.fmgMapId) {
      await this.loadMapDataForMapId(this.fmgMapId);
    } else {
      for (const count of Object.values(
        window.mapData!.proCategoryLocationCounts
      )) {
        if (count > 0) {
          await this.loadMapDataForMapId(window.mapData!.map.id);
          break;
        }
      }
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

  private setupUser() {
    if (window.user) {
      window.user!.hasPro = true;

      window.mapData!.maxMarkedLocations = Infinity;
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

  public async start() {
    await waitForProperty(window, "mapData");

    this.setupUser();
    this.unlockMapSelector();

    // Load map data and heatmaps for pro maps and maps with heatmaps
    await this.loadMapData();
    await this.loadHeatmaps();

    if (!window.user) {
      await activateBlockedMapgenieScript("map");
      return;
    }

    // Login client from map data
    this.client.loginFromMap();

    // Load user data
    await this.loadUserData();

    await activateBlockedMapgenieScript("map");

    this.setupEventListeners();
    await this.client.installInterceptor();
    await this.client.storageRequestPersist();
  }
}
