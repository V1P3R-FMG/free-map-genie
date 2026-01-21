import { Key } from "@/common/storage";
import { AxiosInterceptor } from "@/common/axios";
import { waitForProperty } from "@/common/object";

import backendService from "@/services/backend.service";
import mapgenieService from "@/services/mapgenie.service";
import backgroundService from "@/services/background.service";

export class Client {
  private readonly et: EventTarget = new EventTarget();

  private readonly backend = backendService.use();
  public readonly mapgenie = mapgenieService.use();

  private interceptor?: AxiosInterceptor;
  private _key?: Key;

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
  }

  public loginFromGame(gameId: number) {
    this._key = Key.fromWindowGame(gameId);
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
    const demoPresets = await this.getDemoPresets(presetOrdering);

    const presets = [...demoPresets, ...userPresets].sort(
      (a, b) => a.order - b.order
    );

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

  private async getDemoPresets(ordering: number[]) {
    let presets = window.mapData?.presets;

    // Fallback to fetching from API if not available in mapData
    if (!presets) {
      const game = await this.mapgenie.fetchGame(this.key.gameId);
      presets = game.default_presets;
    }

    //Invert IDs to avoid conflicts with local saved presets
    presets.forEach((preset) => {
      const order = ordering.indexOf(preset.id);
      preset.id = -preset.id;
      preset.order = order !== -1 ? order : 0;
    });

    return presets;
  }

  public addUserProfile(id: number) {
    return this.backend.addUserProfile(id);
  }

  public getActiveProfileId() {
    return this.backend.getActiveProfileId();
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
        await this.backend.updateNote(this.key, ctx.params.id, ctx.postData);
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/notes/:id",
      async (ctx) => {
        logger.debug("Intercepted note delete request", ctx);
        await this.backend.deleteNote(this.key, ctx.params.id);
        ctx.block();
      }
    );

    this.interceptor.post<{}, MG.Api.PresetPostData>(
      "/api/v1/user/presets",
      async (ctx) => {
        logger.debug("Intercepted preset create request", ctx);
        const preset = await this.backend.addPreset(this.key, ctx.postData);
        ctx.block(preset);
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/presets/:id",
      async (ctx) => {
        logger.debug("Intercepted preset delete request", ctx);
        await this.backend.deletePreset(this.key, Number(ctx.params.id));
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
