import { AbstractRepository } from "./abstract";

import type { Key } from "../../../key";

export interface PresetModelV1 {
  id: number;
  game_id: number;
  user_id: number;
  title: string;
  categories: number[];
}

export type PresetInsertModelV1 = Omit<
  PresetModelV1,
  "id" | "game_id" | "user_id"
>;

export class PresetsRepositoryV1 extends AbstractRepository<
  PresetModelV1,
  number,
  Omit<PresetModelV1, "id">
> {
  public readonly tableName = "presets";
  public readonly index = "++id, [game_id+user_id], user_id";

  public async add(key: Key, preset: PresetInsertModelV1) {
    return this.table.add({
      ...preset,
      game_id: key.gameId,
      user_id: key.userId,
    });
  }

  public async has(key: Key) {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .count()
      .then((count) => count > 0);
  }

  public async set(
    key: Key,
    presets: (PresetInsertModelV1 & { id?: number })[]
  ) {
    return this.dexie.transaction("rw", this.table, async () => {
      await this.clear(key);
      return this.table.bulkAdd(
        presets.map(({ id: _, ...preset }) => ({
          ...preset,
          game_id: key.gameId,
          user_id: key.userId,
        })),
        { allKeys: true }
      );
    });
  }

  public async delete(id: number) {
    await this.table.where({ id }).delete();
  }

  public async clear(key: Key) {
    await this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .delete();
  }

  public async get(key: Key) {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .toArray()
      .then((presets) => presets.map((preset) => this.asPreset(preset)));
  }

  public asPreset(model: PresetModelV1): Omit<MG.Preset, "order"> {
    return PresetsRepositoryV1.asPreset(model);
  }

  public static asPreset(model: PresetModelV1): Omit<MG.Preset, "order"> {
    return {
      id: model.id,
      title: model.title,
      categories: model.categories,
    };
  }
}
