import { Key } from "./key";
import { DexieDatabase, LocalDatabase } from "./databases";

import type { Bookmark } from "@/common/bookmark";

export type { UserData } from "./format";
export { Key } from "./key";

export class Storage {
  private readonly domains = new Map<string, LocalDatabase>();
  private readonly dexie = new DexieDatabase();

  public async migrate(domain: string, key: Key) {
    const local = this.getDomainDatabase(domain);

    if (await local.hasData(key)) {
      const data = await local.getData(key);
      await this.dexie.setData(key, data);
      await local.removeData(key);
    }
  }

  private getDomainDatabase(domain: string) {
    let database = this.domains.get(domain);
    if (!database) {
      database = new LocalDatabase(domain);
      this.domains.set(domain, database);
    }
    return database;
  }

  public async getData(key: Key) {
    return this.dexie.getData(key);
  }

  public async markLocationFound(key: Key, locationId: number, found: boolean) {
    if (found) {
      await this.dexie.putLocation(key, locationId);
    } else {
      await this.dexie.deleteLocation(locationId);
    }
  }

  public async trackCategory(key: Key, categoryId: number, track: boolean) {
    if (track) {
      await this.dexie.putTrackedCategory(key, categoryId);
    } else {
      await this.dexie.deleteTrackedCategory(categoryId);
    }
  }

  public async addNote(key: Key, note: Omit<MG.Note, "id">) {
    return this.dexie.addNote(key, note);
  }

  public async deleteNote(key: Key, noteId: string) {
    return this.dexie.deleteNote(key, noteId);
  }

  public async updateNote(key: Key, noteId: string, updates: Partial<MG.Note>) {
    return this.dexie.updateNote(key, noteId, updates);
  }

  public async addPreset(key: Key, preset: MG.Api.PresetPostData) {
    return this.dexie.addPreset(key, preset);
  }

  public async deletePreset(key: Key, presetId: number) {
    return this.dexie.deletePreset(key, presetId);
  }

  public async reorderPresets(key: Key, order: number[]) {
    return this.dexie.reorderPresets(key, order);
  }

  public async storageRequestPersist() {
    const permission = await navigator.permissions.query({
      name: "persistent-storage",
    });

    if (permission.state === "granted") {
      return navigator.storage.persist();
    } else {
      console.warn(
        "Persistent storage permission not granted:",
        permission.state
      );
      return false;
    }
  }

  public storageEstimate() {
    return navigator.storage.estimate();
  }

  public isStoragePersisted() {
    return navigator.storage.persisted();
  }

  public getBookmarks() {
    return this.dexie.getBookmarks();
  }

  public addBookmark(bookmark: Bookmark) {
    return this.dexie.addBookmark(bookmark);
  }

  public deleteBookmark(url: string) {
    return this.dexie.deleteBookmark(url);
  }

  public getProfiles() {
    return this.dexie.getProfiles();
  }

  public addUserProfile(id: number) {
    return this.dexie.addUserProfile(id);
  }

  public addGuestProfile() {
    return this.dexie.addGuestProfile();
  }

  public deleteGuestProfile() {
    return this.dexie.deleteGuestProfile();
  }

  public getActiveProfileId() {
    return this.dexie.getActiveProfileId();
  }

  public activateProfile(id: number) {
    return this.dexie.setActiveProfile(id);
  }
}
