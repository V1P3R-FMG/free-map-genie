import { AbstractRepository } from "./abstract";

import type { Key } from "../../../key";

export interface CategoryModelV1 {
  game_id: number;
  user_id: number;
  id: number;
}

export class CategoriesRepositoryV1 extends AbstractRepository<
  CategoryModelV1,
  [number, number]
> {
  public readonly tableName = "categories";
  public readonly index = "[id+user_id], [game_id+user_id], user_id";

  public async setTracked(key: Key, id: number, tracked: boolean) {
    if (tracked) {
      await this.table.put({
        game_id: key.gameId,
        user_id: key.userId,
        id,
      });
    } else {
      await this.table.where({ id, user_id: key.userId }).delete();
    }
  }

  public async has(key: Key) {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .count()
      .then((count) => count > 0);
  }

  public async set(key: Key, categories: number[]) {
    await this.dexie.transaction("rw", this.table, async () => {
      await this.clear(key);
      await this.table.bulkAdd(
        categories.map((id) => ({
          game_id: key.gameId,
          user_id: key.userId,
          id,
        }))
      );
    });
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
      .then((categories) => categories.map((category) => category.id));
  }

  public async getChecklist(key: Key): Promise<Record<number, true>> {
    return this.table
      .where({ user_id: key.userId })
      .toArray()
      .then((categories) => categories.map((category) => [category.id, true]))
      .then(Object.fromEntries);
  }
}
