import { AbstractRepository } from "./abstract";

import type { Key } from "../../../key";
import { nanoid } from "nanoid";

export interface NoteModelV1 {
  id: string;
  game_id: number;
  user_id: number;
  map_id: number;
  title: string;
  description: string;
  color: string | null;
  category: number | null;
  latitude: number;
  longitude: number;
  created_at: string;
}

export type NoteInsertModelV1 = Omit<NoteModelV1, "game_id" | "user_id" | "id">;

export class NotesRepositoryV1 extends AbstractRepository<NoteModelV1, string> {
  public readonly tableName = "notes";
  public readonly index = "id, [game_id+user_id], user_id";

  public asNote(model: NoteModelV1): MG.Note {
    return NotesRepositoryV1.asNote(model);
  }

  public static asNote(model: NoteModelV1): MG.Note {
    return {
      id: model.id,
      map_id: model.map_id,
      user_id: model.user_id,
      title: model.title,
      description: model.description,
      color: model.color,
      category: model.category,
      latitude: model.latitude,
      longitude: model.longitude,
      created_at: model.created_at,
    };
  }

  public async add(key: Key, note: NoteInsertModelV1) {
    return this.table.add({
      ...note,
      id: nanoid(7),
      user_id: key.userId,
      game_id: key.gameId,
    });
  }

  public async has(key: Key) {
    return this.table
      .where({ game_id: key.gameId, user_id: key.userId })
      .count()
      .then((count) => count > 0);
  }

  public async set(key: Key, notes: MG.Note[]) {
    await this.dexie.transaction("rw", this.table, async () => {
      await this.clear(key);
      await this.table.bulkAdd(
        notes.map((note) => ({
          ...note,
          id: nanoid(7),
          game_id: key.gameId,
          user_id: key.userId,
        }))
      );
    });
  }

  public async delete(id: string) {
    await this.table.where({ id }).delete();
  }

  public async update(id: string, updates: Partial<MG.Note>) {
    await this.table.where({ id }).modify(updates);
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
      .then((notes) => notes.map((note) => this.asNote(note)));
  }
}
