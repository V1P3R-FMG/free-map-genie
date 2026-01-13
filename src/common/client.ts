import { waitForAxios } from "@/common/axios";
import { Key } from "@/common/storage";
import { AxiosInterceptor } from "@/common/axios";

import backendService from "@/services/backend.service";
import mapgenieService from "@/services/mapgenie.service";

export class Client {
  private readonly et: EventTarget = new EventTarget();
  private readonly key: Key;

  private static readonly backend = backendService.use();
  private static readonly mapgenie = mapgenieService.use();

  private get backend() {
    return Client.backend;
  }

  private get mapgenie() {
    return Client.mapgenie;
  }

  private interceptor?: AxiosInterceptor;

  public constructor(key: Key) {
    this.key = key;
  }

  public static forMap() {
    return new Client(Key.fromWindow());
  }

  public static forGame(gameId: number) {
    return new Client(Key.fromWindowGame(gameId));
  }

  public static async forUrl(url: string) {
    const games = await this.mapgenie.fetchGames();

    const { hostname, pathname } = new URL(url);
    const [_, slug] = pathname.split("/");

    const filteredGames = games.filter((g) => g.domain === hostname);

    if (filteredGames.length === 0) {
      throw new Error("No game found for URL");
    }

    if (filteredGames.length === 1) {
      const { id } = filteredGames[0];
      return this.forGame(id);
    }

    const matchedGame = filteredGames.find((g) => g.slug === slug);
    if (!matchedGame) {
      throw new Error("No game found for URL");
    }

    return this.forGame(matchedGame.id);
  }

  public async installInterceptor() {
    if (this.interceptor) return;
    const axios = await waitForAxios();
    this.interceptor = new AxiosInterceptor(axios);
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

  public async fetchGames() {
    return this.mapgenie.fetchGames();
  }

  public async fetchGame(gameId: number | string) {
    return this.mapgenie.fetchGame(gameId);
  }

  public async fetchMap(mapId: number | string) {
    return this.mapgenie.fetchMap(mapId);
  }

  public async fetchHeatmaps(mapId: number | string) {
    return this.mapgenie.fetchHeatmaps(mapId);
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
