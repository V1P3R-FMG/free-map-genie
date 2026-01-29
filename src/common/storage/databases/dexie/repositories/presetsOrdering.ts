import { AbstractRepository } from "./abstract";

import type { Key } from "../../../key";

export interface PresetOrderModelV1 {
  id: number;
  game_id: number;
  user_id: number;
  order: number;
}

export class PresetsOrderingRepositoryV1 extends AbstractRepository<
  PresetOrderModelV1,
  [number, number]
> {
  public readonly tableName = "presetsOrdering";
  public readonly index = "[id+user_id], [game_id+user_id], order, user_id";

  public async add(key: Key, id: number, order: number) {
    return this.table.add({
      id,
      order,
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

  public async set(key: Key, ordering: number[]) {
    await this.dexie.transaction("rw", this.table, async () => {
      await this.clear(key);
      await this.table.bulkAdd(
        ordering.map((id, index) => ({
          id,
          game_id: key.gameId,
          user_id: key.userId,
          order: index,
        }))
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
      .sortBy("order")
      .then((ordering) => ordering.map((item) => item.id));
  }
}
