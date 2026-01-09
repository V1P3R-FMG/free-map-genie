import { Key } from "./key";
import { DexieDatabase, LocalDatabase } from "./databases";

import type { UserData } from "./format";

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
      logger.log(
        `Migrated data for domain ${domain} and key ${JSON.stringify(key)}`
      );
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

  public async setData(key: Key, data: UserData) {
    await this.dexie.setData(key, data);
  }

  public async putLocation(key: Key, locationId: number) {
    await this.dexie.addLocation(key, locationId);
  }

  public async deleteLocation(locationId: number) {
    await this.dexie.deleteLocation(locationId);
  }

  public async putTrackedCategory(key: Key, categoryId: number) {
    await this.dexie.addTrackedCategory(key, categoryId);
  }

  public async deleteTrackedCategory(categoryId: number) {
    await this.dexie.deleteTrackedCategory(categoryId);
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

  public async putPresets(key: Key, presets: MG.Preset[]) {
    return this.dexie.putPresets(key, presets);
  }

  public async deletePreset(key: Key, presetId: number) {
    return this.dexie.deletePreset(key, presetId);
  }

  public async getPresetOrdering(key: Key) {
    return this.dexie.getPresetOrdering(key);
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
}
