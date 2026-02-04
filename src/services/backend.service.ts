import { nanoid } from "nanoid";
import { DexieDatabase } from "@/common/storage/databases";
import { Migrator } from "@/common/storage/migrator";
import { createService, type ProxiedObject } from "@/common/messaging";
import { getAuthToken, setAuthToken } from "@/common/mapgenie";

import mapgenieService from "./mapgenie.service";

import type { Key, UserData } from "@/common/storage";
import type { Bookmark } from "@/common/bookmark";

class BackendService {
  private readonly migrator = new Migrator();
  private readonly database = new DexieDatabase();

  private readonly mapgenie = mapgenieService.use();

  public getAuthToken() {
    return getAuthToken();
  }

  public setAuthToken(token: string | null) {
    setAuthToken(token);
  }

  public isLoggedIn() {
    const authToken = this.getAuthToken();
    return !!authToken;
  }

  public storageEstimate() {
    return navigator.storage.estimate();
  }

  public isStoragePersisted() {
    return navigator.storage.persisted();
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

  public async migrate(domain: string, key: Key) {
    await this.migrator.migrate(domain, key);
  }

  public async updateUser() {
    if (!this.isLoggedIn()) {
      await this.database.profiles.deleteUser();
      return;
    }

    const userData = await this.mapgenie.fetchUser(1);

    await this.database.profiles.replaceUser(userData.id, userData.username);
  }

  public async importFromMapgenieAccount(key: Key) {
    if (!this.isLoggedIn()) {
      throw new Error("User is not logged in");
    }

    const user = await this.mapgenie.fetchUser(key.gameId);
    await this.database.importMapgenie(key, user);
  }

  public async import(games: Record<number, UserData>) {
    const user = await this.database.profiles.getActive();
    if (user === null) {
      throw new Error("No active user profile found");
    }

    return this.database.import(user.id, games);
  }

  public async export(userId: number, gameId?: number) {
    const games = await this.database.export(userId, gameId);

    return { userId, games };
  }

  public async exportActiveUser(gameId?: number) {
    const user = await this.database.profiles.getActive();
    if (user === null) {
      throw new Error("No active user profile found");
    }
    return this.export(user.id, gameId);
  }

  public async getData(key: Key) {
    return this.database.getData(key);
  }

  public async removeData(key: Key) {
    await this.database.removeData(key);
  }

  public async markLocationFound(key: Key, locationId: number, found: boolean) {
    await this.database.locations.setFound(key, locationId, found);
  }

  public async deleteLocations(locationIds: number[]) {
    await this.database.locations.deleteIds(locationIds);
  }

  public async trackCategory(key: Key, categoryId: number, track: boolean) {
    await this.database.categories.setTracked(key, categoryId, track);
  }

  public async addNote(key: Key, note: Omit<MG.Note, "id" | "created_at">) {
    const created_at = new Date().toISOString();
    const id = await this.database.notes.add(key, { ...note, created_at });
    return { ...note, created_at, id };
  }

  public async updateNote(id: string, updates: Partial<MG.Note>) {
    return this.database.notes.update(id, updates);
  }

  public async deleteNote(noteId: string) {
    return this.database.notes.delete(noteId);
  }

  public async addPreset(
    key: Key,
    preset: Omit<MG.Preset, "id" | "order">,
    ordering: number[]
  ) {
    return this.database.transaction(
      "rw",
      this.database.presets.table,
      this.database.presetsOrdering.table,
      async () => {
        const order = ordering.length;
        const id = await this.database.presets.add(key, preset);

        await this.reorderPresets(key, [...ordering, id]);

        return { ...preset, order, id };
      }
    );
  }

  public async deletePreset(presetId: number) {
    await this.database.presets.delete(presetId);
    await this.database.presetsOrdering.delete(presetId);
  }

  public async reorderPresets(key: Key, ordering: number[]) {
    await this.database.presetsOrdering.set(key, ordering);
  }

  public async getBookmarks() {
    return this.database.bookmarks.get();
  }

  public async addBookmark(bookmark: Omit<Bookmark, "createdAt">) {
    const createdAt = new Date().toISOString();
    await this.database.bookmarks.add({ ...bookmark, createdAt });
  }

  public async deleteBookmark(url: string) {
    await this.database.bookmarks.delete(url);
  }

  public async getActiveProfile() {
    return this.database.profiles.getActive();
  }

  public async getProfiles() {
    return this.database.profiles.get();
  }

  public async addGuestProfile() {
    return this.database.profiles.addGuest();
  }

  public async deleteGuestProfile() {
    await this.database.profiles.deleteGuest();
    return this.database.profiles.get();
  }

  public async setActiveProfile(id: number) {
    await this.database.profiles.setActive(id);
  }
}

const backendService = createService({
  context: BackendService,
  namespace: "BackendService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace backendService {
  export type Instance = ProxiedObject<BackendService>;
}

export default backendService;
