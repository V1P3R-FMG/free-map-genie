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

    // Get the active user from the backend
    const activeUserId = await this.client.getActiveUserId();

    // Update the user
    window.user.realId = window.user.id;
    window.user.id = activeUserId ?? window.user.id;
    window.user!.hasPro = true;

    window.mapData!.maxMarkedLocations = Infinity;
  }

  private async loadUserData() {
    if (!window.user || !window.mapData) return;

    await this.client.migrate();
    const data = await this.client.getData();

    // Be defensive about every field below. The page's map data and the
    // backend response can both be partially populated (e.g. a fresh free
    // account whose user.locations is null). A thrown TypeError here would leave
    // window.user.locations unset, which makes map.js crash on boot ("Cannot
    // convert undefined or null to object") and silently breaks marking.
    const currentMapId = window.mapData.map?.id;

    // Scope the saved found-locations to the current map. The backend stores
    // them per game (across every map of the game), so they must be filtered to
    // this map or the "found" counter leaks in locations from the game's other
    // maps (and other games). The page used to embed window.mapData.locations
    // we could filter against, but Map Genie now loads it dynamically for
    // logged-in users (it's usually empty here), so we resolve the map's
    // location ids from the API in that case.
    const mapLocations = window.mapData.locations ?? [];
    const mapLocationIds =
      mapLocations.length > 0
        ? new Set(mapLocations.map((loc) => loc.id))
        : currentMapId != null
          ? await this.client
              .getMapLocationIds(currentMapId)
              .catch(() => new Set<number>())
          : new Set<number>();

    const filteredLocations = Object.fromEntries(
      Object.keys(data.locations ?? {})
        .filter((id) => mapLocationIds.has(Number(id)))
        .map((id) => [id, true])
    );

    const filteredNotes = (data.notes ?? []).filter(
      (note) => note.map_id === currentMapId
    );

    window.user.locations = filteredLocations;
    window.user.trackedCategoryIds = data.trackedCategoryIds ?? [];

    window.mapData.notes = filteredNotes;
    window.mapData.presets = data.presets ?? [];
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

  @LazyGetter()
  private get hasProCategoryLocations() {
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
    if (!window.mapData) return;

    if (this.fmgMapId !== null) {
      await this.loadMapDataForMapId(this.fmgMapId);
      return;
    }

    if (this.hasProCategoryLocations) {
      await this.loadMapDataForMapId(window.mapData!.map.id);
    }
  }

  private async loadHeatmaps() {
    if (!window.mapData?.heatmapGroups) return;

    const hasHeatmaps = window.mapData.heatmapGroups.length > 0;
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

  /**
   * Pin the two scalar pro flags so they survive Map Genie's map.js boot.
   *
   * After we re-inject the blocked map.js it boots and re-syncs the user from
   * GET /api/v1/user/map-data/{mapId}. Most of that re-sync (found locations,
   * tracked categories, notes, presets) is already handled by answering that
   * request with FMG's data, see installMapDataResyncInterceptor in client.ts.
   * The two flags below gate the pro behaviour and are cheap, read-mostly
   * values, so we pin them here as well, as a safety net in case answering the
   * map-data request ever falls back to the server:
   *
   *   window.user.hasPro                -> true      canMarkLocation() reads it
   *                                                  live, false re-locks the cap
   *                                                  and stops marking
   *   window.mapData.maxMarkedLocations -> Infinity  removes the free-user cap
   *
   * They are defined as getters with a no-op setter so map.js's re-sync
   * assignment is silently ignored. A plain read-only property would throw
   * instead, because map.js runs in strict mode.
   *
   * Only these two scalars are pinned. We deliberately do not trap the data
   * collections (locations, trackedCategoryIds, notes, presets): trapping those
   * made the v3 React UI misbehave, so they are kept correct through the
   * map-data interceptor instead.
   */
  private lockProUnlock() {
    if (window.user) {
      this.lockValue(window.user, "hasPro", true);
    }

    if (window.mapData) {
      this.lockValue(window.mapData, "maxMarkedLocations", Infinity);
    }
  }

  /**
   * Define `obj[key]` as a getter that always returns `value`, with a no-op
   * setter so a later assignment is silently ignored instead of throwing.
   */
  private lockValue(obj: object, key: PropertyKey, value: unknown) {
    Object.defineProperty(obj, key, {
      configurable: true,
      enumerable: true,
      get: () => value,
      set: () => {},
    });
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

  public async start() {
    await waitForProperty(window, "mapData");

    // Enrich the page with pro data. Every step here is best-effort: a failure
    // (e.g. the Map Genie data API rejecting a missing/expired X-Api-Secret)
    // must only be logged, never thrown. Otherwise it would abort start()
    // before activateBlockedMapgenieScript() re-injects the blocked map.js and
    // the map would never render. On failure we fall back to the page's
    // original map data.
    try {
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
    } catch (err) {
      logger.error("Failed to set up pro map, loading map anyway.", err);
    }

    if (!window.user) {
      await activateBlockedMapgenieScript("map");

      // In development mode, auto-login and load map data to speed up testing
      if (import.meta.env.DEV) {
        await this.login();
      }

      return;
    }

    // Login client from map data. Kept outside the best-effort block below so
    // the request interceptor can register its handlers even if loading the
    // saved user data fails.
    this.client.loginFromMap();

    // Best-effort: load the logged-in user's saved data. Like the block above
    // this must never abort start() before map.js is re-injected.
    try {
      // Request persistend storage
      await this.client.storageRequestPersist();

      // Load user data
      await this.loadUserData();

      // Fix alt map sdk if needed
      this.fixAltMapSdk();
    } catch (err) {
      logger.error("Failed to load user map data, loading map anyway.", err);
    }

    // Pin the pro flags right before map.js boots, so its boot-time re-sync
    // (GET /api/v1/user/map-data/{mapId}) can't flip hasPro back to false and
    // re-lock the free-user cap. Without this, map.js treats the user as free
    // and stops sending mark/track requests, so nothing gets saved.
    this.lockProUnlock();

    // Answer map.js's boot re-sync (GET /api/v1/user/map-data/{mapId}) at the
    // XMLHttpRequest layer with FMG's data, so it re-applies our found locations
    // and pro state instead of the server's free-account data. map.js makes this
    // request through its own bundled axios rather than window.axios, so the
    // AxiosInterceptor cannot see it. That is why this hooks at the XHR level.
    this.client.installMapDataResyncInterceptor();

    await activateBlockedMapgenieScript("map");

    this.setupEventListeners();
    await this.client.installInterceptor();
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
