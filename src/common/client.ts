import { waitForAxios } from "@/common/axios";
import { Key } from "@/common/storage";

import backendService from "@/services/backend.service";
import mapgenieService from "@/services/mapgenie.service";

import { AxiosInterceptor } from "@/common/axios";

export class Client {
  private readonly key: Key;

  private readonly backend = backendService.use();
  private readonly mapgenieApi = mapgenieService.use();

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
    return this.mapgenieApi.fetchGames();
  }

  public async fetchGame(gameId: number) {
    return this.mapgenieApi.fetchGame(gameId);
  }

  public async fetchHeatmaps(mapId: number) {
    return this.mapgenieApi.fetchHeatmaps(mapId);
  }

  private async getDemoPresets(ordering: number[]) {
    let presets = window.mapData?.presets;

    // Fallback to fetching from API if not available in mapData
    if (!presets) {
      const game = await this.mapgenieApi.fetchGame(this.key.gameId);
      presets = game.default_presets;
    }

    //Invert IDs to avoid conflicts with local saved presets
    presets.forEach((preset) => {
      preset.id = -preset.id;
      preset.order = ordering.indexOf(preset.id) || 0;
    });

    return presets;
  }

  private registerHandlers() {
    if (!this.interceptor) return;

    this.interceptor.put<{ id: string }>(
      "/api/v1/user/locations/:id",
      async (ctx) => {
        logger.debug("Blocking location mark request", ctx.params);
        await this.backend.putLocation(this.key, Number(ctx.params.id));
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/locations/:id",
      async (ctx) => {
        logger.debug("Blocking location unmark request", ctx.params);
        await this.backend.deleteLocation(Number(ctx.params.id));
        ctx.block();
      }
    );

    this.interceptor.post<{}, { category: number }>(
      "/api/v1/user/categories",
      async (ctx) => {
        logger.debug("Blocking category track request", ctx.postData);
        await this.backend.putTrackedCategory(this.key, ctx.postData.category);
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/categories/:id",
      async (ctx) => {
        logger.debug("Blocking category untrack request", ctx.params);
        await this.backend.deleteTrackedCategory(Number(ctx.params.id));
        ctx.block();
      }
    );

    this.interceptor.post<{}, MG.Api.NotePostData>(
      "/api/v1/user/notes",
      async (ctx) => {
        logger.debug("Blocking note create request", ctx.postData);
        const note = await this.backend.addNote(this.key, ctx.postData);
        ctx.block(note);
      }
    );

    this.interceptor.put<{ id: string }, Partial<MG.Note>>(
      "/api/v1/user/notes/:id",
      async (ctx) => {
        logger.debug("Blocking note update request", ctx.params, ctx.postData);
        await this.backend.updateNote(this.key, ctx.params.id, ctx.postData);
        ctx.block();
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/notes/:id",
      async (ctx) => {
        logger.debug("Blocking note delete request", ctx.params);
        await this.backend.deleteNote(this.key, ctx.params.id);
        ctx.block();
      }
    );

    this.interceptor.post<{}, MG.Api.PresetPostData>(
      "/api/v1/user/presets",
      async (ctx) => {
        logger.debug("Blocking preset create request", ctx.postData);
        const preset = await this.backend.addPreset(this.key, ctx.postData);
        ctx.block(preset);
      }
    );

    this.interceptor.delete<{ id: string }>(
      "/api/v1/user/presets/:id",
      async (ctx) => {
        logger.debug(
          "Blocking preset delete request",
          ctx.params,
          ctx.postData
        );
        await this.backend.deletePreset(this.key, Number(ctx.params.id));
        ctx.block();
      }
    );

    this.interceptor.post<{}, { ordering: number[] }>(
      "/api/v1/user/presets/reorder",
      async (ctx) => {
        logger.debug("Blocking preset reorder request", ctx.postData);
        await this.backend.reorderPresets(this.key, ctx.postData.ordering);
        ctx.block();
      }
    );
  }
}
