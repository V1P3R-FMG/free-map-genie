import Dexie, { type Table, type CollectionForTable } from "dexie";

import type { Key } from "../../key";
import type { Database } from "../database";
import type { Stores } from "./stores";
import type { UserData } from "../../format";

import { nanoid } from "nanoid";

// fmg@v3
export class DexieDatabase implements Database {
  private readonly db: Dexie & Stores;

  public constructor() {
    this.db = new Dexie("fmg:database") as Dexie & Stores;

    this.db.version(1).stores({
      meta: "[map_id+user_id], [game_id+user_id]",
      locations: "id, [game_id+user_id]",
      trackedCategories: "id, [game_id+user_id]",
      presets: "++id, [game_id+user_id]",
      presetsOrdering: "id, order, [game_id+user_id]",
      notes: "[id+user_id], [map_id+user_id], [game_id+user_id]",
    });
  }

  public async open(): Promise<void> {}
  public async close(): Promise<void> {}

  public async hasData(key: Key) {
    return this.meta(key).count().then(Boolean);
  }

  public async getData(key: Key): Promise<UserData> {
    const locationsIds = await this.locations(key).primaryKeys();
    const trackedCategoryIds = await this.trackedCategories(key).primaryKeys();

    const locations = Object.fromEntries(
      locationsIds.map((id) => [id.toString(), true])
    );

    return {
      locations,
      trackedCategoryIds,
    };
  }

  public async setData(key: Key, data: UserData) {
    await this.db.transaction(
      "rw",
      this.db.locations,
      this.db.trackedCategories,
      async () => {
        const locationIds = Object.keys(data.locations).map(Number);

        await this.setLocations(key, locationIds);
        await this.setTrackedCategories(key, data.trackedCategoryIds);
      }
    );
  }

  public async removeData(key: Key): Promise<void> {
    await this.db.transaction(
      "rw",
      this.db.meta,
      this.db.locations,
      this.db.trackedCategories,
      this.db.presets,
      this.db.presetsOrdering,
      this.db.notes,
      async () => {
        await this.meta(key).delete();
        await this.locations(key).delete();
        await this.trackedCategories(key).delete();
        await this.presets(key).delete();
        await this.presetsOrdering(key).delete();
        await this.notes(key).delete();
      }
    );
  }

  private keyIndex({ gameId, userId }: Key) {
    return [gameId, userId] as const;
  }

  private selectByKey<T extends Table<any, any, any>>(table: T, key: Key) {
    return table
      .where("[game_id+user_id]")
      .equals(this.keyIndex(key)) as CollectionForTable<T>;
  }

  private meta(key: Key) {
    return this.selectByKey(this.db.meta, key);
  }

  private locations(key: Key) {
    return this.selectByKey(this.db.locations, key);
  }

  public trackedCategories(key: Key) {
    return this.selectByKey(this.db.trackedCategories, key);
  }

  public presets(key: Key) {
    return this.selectByKey(this.db.presets, key);
  }

  public presetsOrdering(key: Key) {
    return this.selectByKey(this.db.presetsOrdering, key);
  }

  public notes(key: Key) {
    return this.selectByKey(this.db.notes, key);
  }

  public async getLastUpdate(key: Key, mapId: number) {
    return this.db.meta
      .where("[map_id+user_id]")
      .equals([mapId, key.userId])
      .first()
      .then((meta) => meta?.last_updated ?? 0);
  }

  public setLocations(key: Key, locationIds: number[]) {
    return this.db.transaction("rw", this.db.locations, async () => {
      await this.locations(key).delete();
      await this.db.locations.bulkAdd(
        locationIds.map((id) => ({
          game_id: key.gameId,
          user_id: key.userId,
          id,
        }))
      );
    });
  }

  public addLocation(key: Key, locationId: number) {
    return this.db.locations.put({
      game_id: key.gameId,
      user_id: key.userId,
      id: locationId,
    });
  }

  public deleteLocation(locationId: number) {
    return this.db.locations.where("id").equals(locationId).delete();
  }

  public setTrackedCategories(key: Key, categoryIds: number[]) {
    return this.db.transaction("rw", this.db.trackedCategories, async () => {
      await this.trackedCategories(key).delete();
      await this.db.trackedCategories.bulkAdd(
        categoryIds.map((id) => ({
          game_id: key.gameId,
          user_id: key.userId,
          id,
        }))
      );
    });
  }

  public addTrackedCategory(key: Key, categoryId: number) {
    return this.db.trackedCategories.put({
      game_id: key.gameId,
      user_id: key.userId,
      id: categoryId,
    });
  }

  public deleteTrackedCategory(categoryId: number) {
    return this.db.trackedCategories.where("id").equals(categoryId).delete();
  }

  public getNotesForMap(key: Key, mapId: number) {
    return this.db.notes
      .where("[map_id+user_id]")
      .equals([mapId, key.userId])
      .toArray();
  }

  public async addNote(key: Key, note: Omit<MG.Note, "id">) {
    const id = nanoid(6);

    await this.db.notes.add({
      ...note,
      game_id: key.gameId,
      user_id: key.userId,
      id,
    });

    return {
      id,
      ...note,
    } as MG.Note;
  }

  public deleteNote(key: Key, noteId: string) {
    return this.db.notes
      .where("[user_id+id]")
      .equals([key.userId, noteId])
      .delete();
  }

  public updateNote(key: Key, noteId: string, updates: Partial<MG.Note>) {
    return this.db.notes
      .where("[user_id+id]")
      .equals([key.userId, noteId])
      .modify(updates);
  }

  public putPresets(key: Key, presets: MG.Preset[]) {
    return this.db.presets.bulkPut(
      presets.map((preset) => ({
        ...preset,
        game_id: key.gameId,
        user_id: key.userId,
      }))
    );
  }

  public async getPresets(key: Key) {
    return this.presets(key).toArray();
  }

  public async addPreset(
    key: Key,
    { ordering, ...preset }: MG.Api.PresetPostData
  ) {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        const id = await this.db.presets.add({
          ...preset,
          game_id: key.gameId,
          user_id: key.userId,
        });

        await this.db.presetsOrdering.add({
          id,
          game_id: key.gameId,
          user_id: key.userId,
          order: ordering.length,
        });

        await this.reorderPresets(key, [...ordering, id]);

        return {
          ...preset,
          id,
        };
      }
    );
  }

  public deletePreset(key: Key, presetId: number) {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        await this.db.presets.where("id").equals(presetId).delete();
        await this.db.presetsOrdering.where("id").equals(presetId).delete();

        const presets = await this.presetsOrdering(key).sortBy("order");

        await this.reorderPresets(
          key,
          presets.map((p) => p.id!)
        );
      }
    );
  }

  public async getPresetOrdering(key: Key) {
    return this.presetsOrdering(key)
      .sortBy("order")
      .then((ordering) => ordering.map((o) => o.id));
  }

  public reorderPresets(key: Key, order: number[]) {
    return this.db.presetsOrdering.bulkPut(
      order.map((id, index) => ({
        id,
        game_id: key.gameId,
        user_id: key.userId,
        order: index,
      }))
    );
  }
}
