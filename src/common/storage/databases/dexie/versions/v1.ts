import type { Bookmark } from "@/common/bookmark";
import type { Table } from "dexie";

import type {
  IdIndex,
  GameUserIndex,
  MapUserIndex,
  UserNoteIndex,
} from "../indexes";

export type MetaTableV1 = Table<
  {
    game_id: number;
    user_id: number;
    map_id: number;
    last_updated: number;
  },
  MapUserIndex
>;

export type LocationsTableV1 = Table<
  {
    game_id: number;
    user_id: number;
    id: number;
  },
  IdIndex
>;

export type TrackedCategoriesTableV1 = Table<
  {
    game_id: number;
    user_id: number;
    id: number;
  },
  IdIndex
>;

export type PresetsTableV1 = Table<
  Omit<MG.Preset, "id"> & {
    id?: number;
    game_id: number;
    user_id: number;
  },
  IdIndex
>;

export type PresetsOrderingTableV1 = Table<
  {
    id: number;
    game_id: number;
    user_id: number;
    order: number;
  },
  IdIndex
>;

export type NotesTableV1 = Table<
  MG.Note & {
    game_id: number;
    user_id: number;
  },
  UserNoteIndex
>;

export type BookmarksTableV1 = Table<Bookmark, string>;
