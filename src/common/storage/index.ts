import { Key } from "./key";
import { DexieDatabase, LocalDatabase } from "./databases";

import type { Bookmark } from "@/common/bookmark";
import type { UserData } from "./format";

export type { UserData } from "./format";
export { Key } from "./key";

export class Storage {
  public async getData(key: Key) {
    return this.dexie.getData(key);
  }

  public async dumpUser(userId: number) {
    return this.dexie.dumpUser(userId);
  }

  public async dumpGame(key: Key) {
    return this.dexie.dumpGame(key);
  }

  // public async import(userId: number, games: Record<Id, UserData>) {
  //   return this.dexie.import(userId, games);
  // }

  public async setData(key: Key, data: UserData) {
    return this.dexie.setData(key, data);
  }

  public async removeData(key: Key) {
    return this.dexie.removeData(key);
  }

  public async markLocationFound(key: Key, locationId: number, found: boolean) {
    if (found) {
      await this.dexie.putLocation(key, locationId);
    } else {
      await this.dexie.deleteLocation(locationId);
    }
  }

  public async clearLocations(locationIds: number[]) {
    return this.dexie.clearLocations(locationIds);
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

  public removeProfile(id: number) {
    return this.dexie.deleteProfile(id);
  }

  public addUserProfile(id: number, name?: string) {
    return this.dexie.addUserProfile(id, name);
  }

  public getUserProfile() {
    return this.dexie.getUserProfile();
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
