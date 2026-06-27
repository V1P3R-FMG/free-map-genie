import { Key } from "@/common/storage";
import { AxiosInterceptor } from "@/common/axios";
import { waitForProperty } from "@/common/object";

import backendService from "@/services/backend.service";
import mapgenieService from "@/services/mapgenie.service";
import clientService from "@/services/client.service";

export class Client {
  private readonly et: EventTarget = new EventTarget();

  private readonly backend = backendService.use();
  public readonly mapgenie = mapgenieService.use();

  private interceptor?: AxiosInterceptor;
  private _key?: Key;
  private mapDataXhrInstalled = false;

  public get isLoggedIn(): boolean {
    return !!this._key;
  }

  public get key(): Key {
    if (!this._key) {
      throw new Error("Client is not logged in");
    }
    return this._key;
  }

  public loginFromMap() {
    this._key = Key.fromWindow();
    clientService.provide(this);
  }

  public loginFromGame(gameId: number) {
    this._key = Key.fromWindowGame(gameId);
    clientService.provide(this);
  }

  public async loginFromGuide() {
    try {
      // Try to get the game ID from axios headers
      const axios = await waitForProperty(window, "axios");
      const gameId = axios!.defaults.headers.common["X-Game-ID"];

      if (gameId) {
        this.loginFromGame(Number(gameId));
        return;
      }
    } catch {
      logger.warn(
        "Could not get game ID from axios headers will fallback to URL-based client, notify the fmg authors to improve this"
      );

      // Fallback to URL-based client
      this.loginFromUrl(window.location.href);
    }
  }

  public async loginFromUrl(url: string) {
    const games = await this.mapgenie.fetchGames();

    const { hostname, pathname } = new URL(url);
    const [_, slug] = pathname.split("/");

    const filteredGames = games.filter((g) => g.domain === hostname);

    if (filteredGames.length === 0) {
      throw new Error("No game found for URL");
    }

    if (filteredGames.length === 1) {
      const { id } = filteredGames[0];
      this.loginFromGame(id);
      return;
    }

    const matchedGame = filteredGames.find((g) => g.slug === slug);
    if (!matchedGame) {
      throw new Error("No game found for URL");
    }

    this.loginFromGame(matchedGame.id);
  }

  public async installInterceptor() {
    if (this.interceptor) return;
    const axios = await waitForProperty(window, "axios");
    this.interceptor = new AxiosInterceptor(axios!);
    this.registerHandlers();
  }

  public uninstallInterceptor() {
    this.interceptor?.uninstall();
    this.interceptor = undefined;
  }

  public async getData() {
    const {
      locations,
      trackedCategoryIds,
      notes,
      presets: userPresets,
      presetOrdering,
    } = await this.backend.getData(this.key);

    const demoPresets = await this.getDemoPresets();
    const presets = [...demoPresets, ...userPresets]
      .map((preset) => {
        const newPreset = { ...preset, order: 0 };
        const order = presetOrdering.indexOf(preset.id);
        newPreset.order = order !== -1 ? order : 0;
        return newPreset;
      })
      .sort((a, b) => a.order - b.order);

    return {
      locations,
      trackedCategoryIds,
      notes,
      presets,
    };
  }

  public async storageRequestPersist() {
    const isPersistend = await this.backend.isStoragePersisted();
    if (isPersistend) return true;
    return this.backend.storageRequestPersist();
  }

  public async migrate() {
    const domain = window.location.host;
    return this.backend.migrate(domain, this.key);
  }

  private async getDemoPresets() {
    let presets = window.mapData?.presets;

    // Fallback to fetching from API if not available in mapData
    if (!presets) {
      const game = await this.mapgenie.fetchGame(this.key.gameId);
      presets = game.default_presets;
    }

    //Invert IDs to avoid conflicts with local saved presets
    presets.forEach((preset) => {
      preset.id = -preset.id;
    });

    return presets;
  }

  public async getActiveUserId() {
    const user = await this.backend.getActiveProfile();
    return user?.id;
  }

  public async importFromMapgenieAccount() {
    await this.backend.importFromMapgenieAccount(this.key);
  }

  public async clearGame() {
    await this.backend.removeData(this.key);
  }

  public async clearMap() {
    const locations = window.mapData!.locations.map((loc) => loc.id);
    await this.backend.deleteLocations(locations);
  }

  public async export() {
    if (!this.isLoggedIn) {
      throw new Error("Client is not logged in");
    }
    const games = await this.backend.export(this.key.userId, this.key.gameId);
    return games;
  }

  public on<K extends keyof Client.EventMap>(
    event: K,
    listener: (e: CustomEvent<Client.EventMap[K]>) => void
  ) {
    this.et.addEventListener(event, listener as EventListener);
  }

  public off<K extends keyof Client.EventMap>(
    event: K,
    listener: (e: CustomEvent<Client.EventMap[K]>) => void
  ) {
    this.et.removeEventListener(event, listener as EventListener);
  }

  /**
   * Resolve the set of location ids that belong to a given map, from the
   * Map Genie API. Used to scope the user's saved found-locations (which the
   * backend stores per game, across all of that game's maps) down to a single
   * map.
   */
  public async getMapLocationIds(mapId: number): Promise<Set<number>> {
    const map = await this.mapgenie.fetchMap(mapId);
    const ids = new Set<number>();
    for (const group of map.groups ?? []) {
      for (const category of group.categories ?? []) {
        for (const location of category.locations ?? []) {
          ids.add(location.id);
        }
      }
    }
    return ids;
  }

  /**
   * Build the `/api/v1/user/map-data/{mapId}` response from FMG's own data, in
   * the same shape Map Genie's server returns. map.js applies this on boot to
   * window.user / window.mapData.
   *
   * The found locations are scoped to this map: the backend stores them per
   * game (every map of the game), but the server's per-map endpoint only
   * returns the ones on the requested map, and map.js counts whatever it gets.
   * Without scoping, the "found" counter would include locations from the
   * game's other maps (and historically other games too).
   */
  private async buildMapDataResponse(mapId: number) {
    const data = await this.getData();

    const mapLocationIds = await this.getMapLocationIds(mapId);
    const locations: Record<number, true> = {};
    for (const id of Object.keys(data.locations ?? {})) {
      if (mapLocationIds.has(Number(id))) locations[Number(id)] = true;
    }

    return {
      // map.js assigns this straight to window.user.locations and looks up
      // found state as `locations[id]`, so it has to be a `{ [id]: true }` set,
      // which is exactly how FMG stores it. Map Genie's own API returns the
      // same shape. The empty `[]` we sometimes see from the server is just PHP
      // encoding an empty associative array as a JSON array.
      locations,
      hasPro: true,
      trackedCategoryIds: data.trackedCategoryIds ?? [],
      suggestions: [],
      presets: data.presets ?? [],
      notes: (data.notes ?? []).filter((note) => note.map_id === mapId),
      maxMarkedLocations: Number.MAX_SAFE_INTEGER,
    };
  }

  /**
   * On boot, map.js re-syncs the user's state with GET
   * /api/v1/user/map-data/{mapId} and applies the response to window.user and
   * window.mapData. If we leave it alone it gets back the server's free account
   * data (hasPro:false, locations:[], maxMarkedLocations:200) and overwrites
   * everything FMG injected, which wipes the found locations we loaded from the
   * backend and re-locks the cap.
   *
   * The catch is that this request does not go through window.axios (the
   * instance our AxiosInterceptor wraps). map.js uses its own bundled axios, so
   * the axios interceptor never sees it. Both axios instances do end up going
   * through XMLHttpRequest, so we intercept there instead and answer the request
   * with FMG's own data. The marking PUT/DELETE still go through window.axios and
   * are short-circuited by the AxiosInterceptor before they reach XHR, so they
   * are not affected by this patch.
   *
   * The v2 extension (the `main` branch) handled the same re-sync by pinning the
   * injected values with getter / no-op-setter property traps (FMG_Map's
   * lockProUnlock there). We answer the request instead because it gives map.js
   * a consistent view: what it reads back from window.user is exactly what it
   * just applied. A property trap, on the other hand, lets map.js's internal
   * state drift away from window.user, and the v3 React UI could end up looping
   * on that. We still pin the two pro flags (hasPro and maxMarkedLocations) as a
   * cheap fallback in setup(), see MapPage.lockProUnlock.
   */
  public installMapDataResyncInterceptor() {
    if (this.mapDataXhrInstalled) return;
    if (!this.isLoggedIn) return;
    this.mapDataXhrInstalled = true;

    const pathRe = /\/api\/v1\/user\/map-data\/(\d+)/;
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    const build = (mapId: number) => this.buildMapDataResponse(mapId);

    XMLHttpRequest.prototype.open = function (this: any, method: string, url: any) {
      const match = String(url).match(pathRe);
      this.__fmgMapId =
        match && String(method).toUpperCase() === "GET" ? Number(match[1]) : null;
      this.__fmgUrl = String(url);
      return origOpen.apply(this, arguments as any);
    };

    XMLHttpRequest.prototype.send = function (this: any, body?: any) {
      if (this.__fmgMapId == null) return origSend.apply(this, arguments as any);

      const xhr = this;
      build(xhr.__fmgMapId)
        .then((data) => {
          const text = JSON.stringify(data);
          const def = (key: string, value: unknown) =>
            Object.defineProperty(xhr, key, { configurable: true, get: () => value });

          def("readyState", 4);
          def("status", 200);
          def("statusText", "OK");
          def("responseText", text);
          def(
            "response",
            xhr.responseType === "" || xhr.responseType === "text" ? text : data
          );
          def("responseURL", xhr.__fmgUrl);
          xhr.getAllResponseHeaders = () => "content-type: application/json\r\n";
          xhr.getResponseHeader = (h: string) =>
            /content-type/i.test(h) ? "application/json" : null;

          xhr.dispatchEvent(new Event("readystatechange"));
          xhr.dispatchEvent(new Event("load"));
          xhr.dispatchEvent(new Event("loadend"));
        })
        .catch((err) => {
          logger.error(
            "Failed to serve FMG map-data over XHR, falling back to server.",
            err
          );
          try {
            origSend.call(xhr, body);
          } catch {}
        });
    };
  }

  private registerHandlers() {
    if (!this.interceptor) return;
    if (!this.isLoggedIn) return;

    this.interceptor.put<{ id: string }>(
      "/api/v1/user/locations/:id",
      async (ctx) => {
        logger.debug("Intercepted location mark request", ctx);
        await this.backend.markLocationFound(
          this.key,
          Number(ctx.params.id),
          true
        );
        this.et.dispatchEvent(
          new CustomEvent<Client.LocationEvent>("locationMarked", {
            detail: {
              locationId: Number(ctx.params.id),
              found: true,
            },
          })
        );
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/locations/:id",
      async (ctx) => {
        logger.debug("Intercepted location unmark request", ctx);
        await this.backend.markLocationFound(
          this.key,
          Number(ctx.params.id),
          false
        );
        this.et.dispatchEvent(
          new CustomEvent<Client.LocationEvent>("locationMarked", {
            detail: {
              locationId: Number(ctx.params.id),
              found: false,
            },
          })
        );
        ctx.block();
      }
    );

    this.interceptor.post<{}, { category: number }>(
      "/api/v1/user/categories",
      async (ctx) => {
        logger.debug("Intercepted category track request", ctx);
        await this.backend.trackCategory(this.key, ctx.postData.category, true);
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/categories/:id",
      async (ctx) => {
        logger.debug("Intercepted category untrack request", ctx);
        await this.backend.trackCategory(
          this.key,
          Number(ctx.params.id),
          false
        );
        ctx.block();
      }
    );

    this.interceptor.post<{}, MG.Api.NotePostData>(
      "/api/v1/user/notes",
      async (ctx) => {
        logger.debug("Intercepted note create request", ctx);
        const note = await this.backend.addNote(this.key, ctx.postData);
        ctx.block(note);
      }
    );

    this.interceptor.put<{ id: string }, Partial<MG.Note>>(
      "/api/v1/user/notes/:id",
      async (ctx) => {
        logger.debug("Intercepted note update request", ctx);
        await this.backend.updateNote(ctx.params.id, ctx.postData);
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/notes/:id",
      async (ctx) => {
        logger.debug("Intercepted note delete request", ctx);
        await this.backend.deleteNote(ctx.params.id);
        ctx.block();
      }
    );

    this.interceptor.post<{}, MG.Api.PresetPostData>(
      "/api/v1/user/presets",
      async (ctx) => {
        logger.debug("Intercepted preset create request", ctx);
        const { ordering, ...presetData } = ctx.postData;
        const preset = await this.backend.addPreset(
          this.key,
          presetData,
          ordering
        );
        ctx.block(preset);
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/presets/:id",
      async (ctx) => {
        logger.debug("Intercepted preset delete request", ctx);
        await this.backend.deletePreset(Number(ctx.params.id));
        ctx.block();
      }
    );

    this.interceptor.post<{}, { ordering: number[] }>(
      "/api/v1/user/presets/reorder",
      async (ctx) => {
        logger.debug("Intercepted preset reorder request", ctx);
        await this.backend.reorderPresets(this.key, ctx.postData.ordering);
        ctx.block();
      }
    );
  }
}

export namespace Client {
  export interface LocationEvent {
    locationId: number;
    found: boolean;
  }

  export interface EventMap {
    locationMarked: LocationEvent;
  }
}
