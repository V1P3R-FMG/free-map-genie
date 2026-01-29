import Dexie from "dexie";
import async from "@/common/async";

import { Repositories } from "./repositories";
import { ExportHelper } from "./exportHelper";

import type { Database } from "../database";
import type { Key } from "../../key";
import type { UserData } from "../../format";

export class DexieDatabase implements Database {
  private readonly dexie = new Dexie("fmg:database");

  private readonly repositories = new Repositories(this.dexie);
  private readonly exportHelper = new ExportHelper(this.repositories);

  public get locations() {
    return this.repositories.locations;
  }

  public get categories() {
    return this.repositories.categories;
  }

  public get presets() {
    return this.repositories.presets;
  }

  public get presetsOrdering() {
    return this.repositories.presetsOrdering;
  }

  public get notes() {
    return this.repositories.notes;
  }

  public get bookmarks() {
    return this.repositories.bookmarks;
  }

  public get profiles() {
    return this.repositories.profiles;
  }

  public async open() {}
  public async close() {}

  public async hasData(key: Key) {
    return async.some([
      this.locations.has(key),
      this.categories.has(key),
      this.presets.has(key),
      this.presetsOrdering.has(key),
      this.notes.has(key),
    ]);
  }

  public async getData(key: Key) {
    const [locations, trackedCategoryIds, presets, presetOrdering, notes] =
      await Promise.all([
        this.locations.getChecklist(key),
        this.categories.get(key),
        this.presets.get(key),
        this.presetsOrdering.get(key),
        this.notes.get(key),
      ]);

    return {
      locations,
      trackedCategoryIds,
      presets,
      presetOrdering,
      notes,
    };
  }

  public async setData(key: Key, data: UserData) {
    await this.dexie.transaction(
      "rw",
      this.locations.table,
      this.categories.table,
      this.presets.table,
      this.presetsOrdering.table,
      this.notes.table,
      async () => {
        const locationIds = Object.keys(data.locations).map(Number);

        await Promise.all([
          this.locations.set(key, locationIds),
          this.categories.set(key, data.trackedCategoryIds),
          this.setPresets(key, data.presets, data.presetOrdering),
          this.notes.set(key, data.notes),
        ]);
      }
    );
  }

  private async setPresets(
    key: Key,
    presets: Omit<MG.Preset, "order">[],
    ordering: number[]
  ) {
    const ids = await this.presets.set(key, presets);
    logger.debug(
      "Preset IDs after set:",
      ids,
      ordering,
      ordering.map((id) => ids[presets.findIndex((p) => p.id === id)] ?? id)
    );
    await this.presetsOrdering.set(
      key,
      ordering.map((id) => ids[presets.findIndex((p) => p.id === id)] ?? id)
    );
  }

  public async removeData(key: Key) {
    await this.dexie.transaction(
      "rw",
      this.locations.table,
      this.categories.table,
      this.presets.table,
      this.presetsOrdering.table,
      this.notes.table,
      async () => {
        await Promise.all([
          this.locations.clear(key),
          this.categories.clear(key),
          this.presets.clear(key),
          this.presetsOrdering.clear(key),
          this.notes.clear(key),
        ]);
      }
    );
  }

  public async import(userId: number, games: Record<Id, UserData>) {
    await this.dexie.transaction(
      "rw",
      this.locations.table,
      this.categories.table,
      this.presets.table,
      this.presetsOrdering.table,
      this.notes.table,
      async () => {
        for (const [gameId, data] of Object.entries(games)) {
          const key = {
            gameId: Number(gameId),
            userId,
          };
          await this.setData(key, data);
        }
      }
    );
  }

  public async importMapgenie(key: Key, user: MG.Api.UserFull) {
    const locations = Object.fromEntries(
      user.locations.map((locId) => [locId, true])
    );
    const trackedCategoryIds = user.tracked_category_ids;
    const notes = user.notes;

    await this.setData(key, {
      locations,
      trackedCategoryIds,
      notes,
      presetOrdering: [],
      presets: [],
    });
  }

  public async export(userId: number, gameId?: number) {
    return this.exportHelper.export(userId, gameId);
  }
}
