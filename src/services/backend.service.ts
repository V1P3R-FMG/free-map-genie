import { DexieDatabase, LocalDatabase } from "@/common/storage";
import { createService, type ProxiedObject } from "@/common/messaging";

import type { Key, UserData } from "@/common/storage";

class BackendService {
  private readonly domains = new Map<string, LocalDatabase>();
  private readonly dexie = new DexieDatabase();

  /**
   * Migrates data from local storage to Dexie database for the given domain and key.
   */
  async migrate(domain: string, key: Key) {
    const database = this.getDomainDatabase(domain);

    if (await database.hasData(key)) {
      const data = await database.getData(key);
      await this.dexie.setData(key, data);
      await database.removeData(key);
      logger.log(
        `Migrated data for domain ${domain} and key ${JSON.stringify(key)}`
      );
    }
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

  private getDomainDatabase(domain: string) {
    let database = this.domains.get(domain);
    if (!database) {
      database = new LocalDatabase(domain);
      this.domains.set(domain, database);
    }
    return database;
  }

  async getData(key: Key) {
    return this.dexie.getData(key);
  }

  async setData(key: Key, data: UserData) {
    await this.dexie.setData(key, data);
  }

  async putLocation(key: Key, locationId: number) {
    await this.dexie.addLocation(key, locationId);
  }

  async deleteLocation(locationId: number) {
    await this.dexie.deleteLocation(locationId);
  }

  async putTrackedCategory(key: Key, categoryId: number) {
    await this.dexie.addTrackedCategory(key, categoryId);
  }

  async deleteTrackedCategory(categoryId: number) {
    await this.dexie.deleteTrackedCategory(categoryId);
  }

  async addNote(key: Key, note: Omit<MG.Note, "id">) {
    return this.dexie.addNote(key, note);
  }

  async deleteNote(key: Key, noteId: string) {
    return this.dexie.deleteNote(key, noteId);
  }

  async updateNote(key: Key, noteId: string, updates: Partial<MG.Note>) {
    return this.dexie.updateNote(key, noteId, updates);
  }

  async addPreset(key: Key, preset: MG.Api.PresetPostData) {
    return this.dexie.addPreset(key, preset);
  }

  async putPresets(key: Key, presets: MG.Preset[]) {
    return this.dexie.putPresets(key, presets);
  }

  async deletePreset(key: Key, presetId: number) {
    return this.dexie.deletePreset(key, presetId);
  }

  async getPresetOrdering(key: Key) {
    return this.dexie.getPresetOrdering(key);
  }

  async reorderPresets(key: Key, order: number[]) {
    return this.dexie.reorderPresets(key, order);
  }
}

const backendService = createService({
  context() {
    return new BackendService();
  },
  heartbeatTimeout: 60000,
  namespace: "BackendService",
});

namespace backendService {
  export type Instance = ProxiedObject<BackendService>;
}

export default backendService;
