import Dexie, { type Table, type CollectionForTable, Collection } from "dexie";
import { nanoid } from "nanoid";

import async from "@/common/async";

import type { Bookmark } from "@/common/bookmark";
import type { Key } from "../../key";
import type { Database } from "../database";
import type { Stores } from "./stores";
import type { IdIndex } from "./indexes";
import type { UserData } from "../../format";
import type { Profile } from "@/common/profile";
import type { ProfileV1, AsProfile } from "./versions/v1";

// fmg@v3
export class DexieDatabase implements Database {
  private readonly db: Dexie & Stores;

  public constructor() {
    this.db = new Dexie("fmg:database") as Dexie & Stores;

    this.db.version(1).stores({
      locations: "id, [game_id+user_id]",
      trackedCategories: "id, [game_id+user_id]",
      presets: "++id, [game_id+user_id]",
      presetsOrdering: "id, order, [game_id+user_id]",
      notes: "[id+user_id], [map_id+user_id], [game_id+user_id]",
      bookmarks: "url, title, createdAt",
      profiles: "id, name, active",
    });
  }

  public async open(): Promise<void> {}
  public async close(): Promise<void> {}

  public async hasData(key: Key) {
    return async.some(
      this.db.tables.map((table) =>
        this.selectByKey(table, key)
          .count()
          .then((count) => count > 0)
      )
    );
  }

  public async getData(key: Key): Promise<UserData> {
    const locationsIds = await this.locations(key).primaryKeys();
    const trackedCategoryIds = await this.trackedCategories(key).primaryKeys();
    const presets = await this.presets(key).toArray();
    const presetOrdering = await this.getPresetOrdering(key);
    const notes = await this.notes(key).toArray();

    const locations = Object.fromEntries(
      locationsIds.map((id) => [id.toString(), true])
    );

    return {
      locations,
      trackedCategoryIds,
      presets,
      presetOrdering,
      notes,
    };
  }

  public async setData(key: Key, data: UserData) {
    await this.db.transaction(
      "rw",
      this.db.locations,
      this.db.trackedCategories,
      this.db.presets,
      this.db.presetsOrdering,
      this.db.notes,
      async () => {
        const locationIds = Object.keys(data.locations).map(Number);

        await this.setLocations(key, locationIds);
        await this.setTrackedCategories(key, data.trackedCategoryIds);
        await this.setPresets(key, data.presets);
        await this.reorderPresets(key, data.presetOrdering);
        await this.setNotes(key, data.notes);
      }
    );
  }

  public async removeData(key: Key): Promise<void> {
    await this.db.transaction(
      "rw",
      this.db.locations,
      this.db.trackedCategories,
      this.db.presets,
      this.db.presetsOrdering,
      this.db.notes,
      async () => {
        await Promise.allSettled([
          this.locations(key).delete(),
          this.trackedCategories(key).delete(),
          this.presets(key).delete(),
          this.presetsOrdering(key).delete(),
          this.notes(key).delete(),
        ]);
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

  private locations(key: Key) {
    return this.selectByKey(this.db.locations, key);
  }

  private trackedCategories(key: Key) {
    return this.selectByKey(this.db.trackedCategories, key);
  }

  private presets(key: Key) {
    return this.selectByKey(this.db.presets, key) as Collection<
      MG.Preset,
      IdIndex
    >;
  }

  private presetsOrdering(key: Key) {
    return this.selectByKey(this.db.presetsOrdering, key);
  }

  private notes(key: Key) {
    return this.selectByKey(this.db.notes, key);
  }

  private setLocations(key: Key, locationIds: number[]) {
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

  public putLocation(key: Key, locationId: number) {
    return this.db.locations.put({
      game_id: key.gameId,
      user_id: key.userId,
      id: locationId,
    });
  }

  public deleteLocation(locationId: number) {
    return this.db.locations.where("id").equals(locationId).delete();
  }

  private setTrackedCategories(key: Key, categoryIds: number[]) {
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

  public putTrackedCategory(key: Key, categoryId: number) {
    return this.db.trackedCategories.put({
      game_id: key.gameId,
      user_id: key.userId,
      id: categoryId,
    });
  }

  public deleteTrackedCategory(categoryId: number) {
    return this.db.trackedCategories.where("id").equals(categoryId).delete();
  }

  private setNotes(key: Key, notes: MG.Note[]) {
    return this.db.transaction("rw", this.db.notes, async () => {
      await this.notes(key).delete();
      await this.db.notes.bulkAdd(
        notes.map((note) => ({
          ...note,
          game_id: key.gameId,
          user_id: key.userId,
        }))
      );
    });
  }

  public async addNote(key: Key, note: Omit<MG.Note, "id">): Promise<MG.Note> {
    const id = nanoid(6);

    return this.db.notes
      .add({
        ...note,
        game_id: key.gameId,
        user_id: key.userId,
        id,
      })
      .then(([_userId, id]) => ({
        ...note,
        id,
      }));
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

  public async setPresets(key: Key, presents: MG.Preset[]) {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        await this.presets(key).delete();
        await this.db.presets.bulkAdd(
          presents.map((preset) => ({
            ...preset,
            game_id: key.gameId,
            user_id: key.userId,
          }))
        );
      }
    );
  }

  public async addPreset(
    key: Key,
    { ordering, ...preset }: MG.Api.PresetPostData
  ): Promise<MG.Preset> {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        const order = ordering.length;

        const id = await this.db.presets.add({
          ...preset,
          order,
          game_id: key.gameId,
          user_id: key.userId,
        });

        await this.db.presetsOrdering.put({
          id,
          game_id: key.gameId,
          user_id: key.userId,
          order,
        });

        await this.reorderPresets(key, [...ordering, id]);

        return {
          ...preset,
          id,
          order,
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
        await this.updatePresetOrdering(key);
      }
    );
  }

  private async getPresetOrdering(key: Key) {
    return this.presetsOrdering(key)
      .sortBy("order")
      .then((ordering) => ordering.map((o) => o.id));
  }

  private async setPresetOrdering(key: Key, ordering: number[]) {
    return this.db.transaction("rw", this.db.presetsOrdering, async () => {
      await this.presetsOrdering(key).delete();
      await this.db.presetsOrdering.bulkAdd(
        ordering.map((id, index) => ({
          id,
          game_id: key.gameId,
          user_id: key.userId,
          order: index,
        }))
      );
    });
  }

  public reorderPresets(key: Key, ordering: number[]) {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        await this.setPresetOrdering(key, ordering);

        await this.db.presets.bulkUpdate(
          ordering.map((id, index) => ({
            key: id,
            changes: {
              order: index,
            },
          }))
        );
      }
    );
  }

  private updatePresetOrdering(key: Key) {
    return this.db.transaction(
      "rw",
      this.db.presets,
      this.db.presetsOrdering,
      async () => {
        const presets = await this.presetsOrdering(key).sortBy("order");

        await this.reorderPresets(
          key,
          presets.map((p) => p.id!)
        );
      }
    );
  }

  public getBookmarks() {
    return this.db.bookmarks.orderBy("createdAt").toArray();
  }

  public addBookmark(bookmark: Bookmark) {
    return this.db.bookmarks.add(bookmark);
  }

  public deleteBookmark(url: string) {
    return this.db.bookmarks.where("url").equals(url).delete();
  }

  private returnProfile<P extends ProfileV1 | undefined>(profile: P) {
    if (!profile) {
      return undefined as AsProfile<P>;
    }

    const { id, name } = profile;
    const active = Boolean(profile.active);

    return { id, name, active } as AsProfile<P>;
  }

  public async getProfiles() {
    const user = await this.db.profiles.where("id").aboveOrEqual(0).first();
    if (!user) return [];

    return this.db.profiles
      .toArray()
      .then((profiles) => profiles.map(this.returnProfile))
      .then((profiles) => profiles.sort((a, b) => b.id - a.id));
  }

  public async getProfile(id: number) {
    const profile = await this.db.profiles.get(id);
    return this.returnProfile(profile);
  }

  public async setActiveProfile(id: number) {
    return this.db.transaction("rw", this.db.profiles, async () => {
      await this.db.profiles.where("active").equals(1).modify({ active: 0 });
      await this.db.profiles.update(id, { active: 1 });
    });
  }

  public async getActiveProfile(): Promise<Profile | undefined> {
    const profile = await this.db.profiles.where("active").equals(1).first();
    return this.returnProfile(profile);
  }

  public async getActiveProfileId() {
    const profile = await this.db.profiles.where("active").equals(1).first();
    return profile?.id;
  }

  public async addUserProfile(id: number, name?: string) {
    return this.db.transaction("rw", this.db.profiles, async () => {
      // We only allow one user profile at a time
      // So we remove any existing user profiles
      await this.db.profiles.where("id").aboveOrEqual(0).delete();

      const active = await this.getActiveProfile();

      const profile = {
        id,
        name: name ?? `User ${id}`,
        active: !active ? 1 : 0,
      };

      await this.db.profiles.add(profile);

      return this.returnProfile(profile);
    });
  }

  public async getUserProfile() {
    const profile = await this.db.profiles.where("id").aboveOrEqual(0).first();
    return this.returnProfile(profile);
  }

  public async deleteProfile(id: number) {
    return this.db.profiles.where("id").equals(id).delete();
  }

  private async getNextGuestProfileId() {
    const guests = await this.db.profiles.where("id").below(0).sortBy("id");

    const { id } = guests[0] || {};

    if (id === undefined) {
      return -1;
    }

    return id - 1;
  }

  public async addGuestProfile() {
    const user = await this.db.profiles.where("id").aboveOrEqual(0).first();
    if (!user) return;

    const id = await this.getNextGuestProfileId();

    const profile = {
      id,
      name: `Guest ${id * -1}`,
      active: 0,
    };

    await this.db.profiles.add(profile);

    return this.returnProfile(profile);
  }

  public async deleteGuestProfile() {
    return this.db.transaction("rw", this.db.profiles, async () => {
      const nextId = await this.getNextGuestProfileId();
      const id = nextId + 1;

      if (id >= 0) return;

      const profile = await this.getProfile(id);
      await this.db.profiles.where("id").equals(id).delete();

      if (profile?.active) {
        const user = await this.db.profiles.where("id").aboveOrEqual(0).first();
        if (user) {
          await this.setActiveProfile(user.id);
        }
      }

      return this.getProfiles();
    });
  }
}
