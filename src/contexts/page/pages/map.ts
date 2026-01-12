import { Page } from "./page";
import { Client } from "@/common/client";
import {
  activateBlockedMapgenieScript,
  makeUserPro,
  removeLocationsLimit,
} from "@/common/mapgenie";
import { mapDataUtils } from "@/common/mapgenie";

export class MapPage extends Page {
  private _client?: Client;
  private _mapId?: number;

  private async loadUserData() {
    if (!window.user || !window.mapData) {
      throw new Error("User or mapData is not available");
    }

    await this.client.migrate();
    const data = await this.client.getData();

    window.user.locations = data.locations;
    window.user.trackedCategoryIds = data.trackedCategoryIds;

    window.mapData.notes = data.notes;
    window.mapData.presets = data.presets;
  }

  private async unlockMapSelector() {
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
    const game = await this.client.fetchGame(window.game!.id);
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

    const heatmaps = await this.client.fetchHeatmaps(window.mapData!.map.id);
    mapDataUtils.loadHeatmaps(heatmaps);
  }

  private get client() {
    return (this._client ??= Client.forMap());
  }

  public async start() {
    await this.client.storageRequestPersist();

    makeUserPro();
    removeLocationsLimit();
    this.unlockMapSelector();

    await this.loadMapData();
    await this.loadHeatmaps();
    await this.loadUserData();

    await activateBlockedMapgenieScript("map");
    await this.client.installInterceptor();
  }

  public async canStart() {
    // We can only start if user, game and mapData are present
    if (!window.user || !window.mapData || !window.game) {
      logger.warn("User not logged in, FMG will not work");

      return false;
    }
    return true;
  }

  public async restore() {
    await activateBlockedMapgenieScript("map");
  }
}
