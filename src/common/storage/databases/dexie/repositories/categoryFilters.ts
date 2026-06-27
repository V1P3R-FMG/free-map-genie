import { AbstractRepository } from "./abstract";

import type { Key } from "../../../key";

export interface CategoryFilterModelV1 {
  game_id: number;
  user_id: number;
  id: number;
  visible: boolean;
}

/**
 * Stores whether each category is shown or hidden in the sidebar, per game and
 * user. Unlike `categories` (which tracks the pro "tracked categories"), this is
 * the plain show/hide filter state, which Map Genie no longer persists itself.
 */
export class CategoryFiltersRepositoryV1 extends AbstractRepository<
  CategoryFilterModelV1,
  [number, number]
> {
  public readonly tableName = "categoryFilters";
  public readonly index = "[id+user_id], [game_id+user_id], user_id";

  public async has(key: Key) {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .count()
      .then((count) => count > 0);
  }

  public async get(key: Key): Promise<Record<number, boolean>> {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .toArray()
      .then((rows) => Object.fromEntries(rows.map((row) => [row.id, row.visible])));
  }

  public async set(key: Key, filters: Record<number, boolean>) {
    await this.dexie.transaction("rw", this.table, async () => {
      await this.clear(key);
      const rows = Object.entries(filters).map(([id, visible]) => ({
        game_id: key.gameId,
        user_id: key.userId,
        id: Number(id),
        visible,
      }));
      if (rows.length > 0) await this.table.bulkAdd(rows);
    });
  }

  public async clear(key: Key) {
    await this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .delete();
  }
}
