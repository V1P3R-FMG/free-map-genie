import { Dexie } from "dexie";

import { LocationsRepositoryV1 } from "./locations";
import { CategoriesRepositoryV1 } from "./categories";
import { CategoryFiltersRepositoryV1 } from "./categoryFilters";
import { PresetsRepositoryV1 } from "./presets";
import { PresetsOrderingRepositoryV1 } from "./presetsOrdering";
import { NotesRepositoryV1 } from "./notes";
import { BookmarksRepositoryV1 } from "./bookmarks";
import { ProfilesRepositoryV1 } from "./profiles";

export {
  LocationsRepositoryV1,
  CategoriesRepositoryV1,
  CategoryFiltersRepositoryV1,
  PresetsRepositoryV1,
  PresetsOrderingRepositoryV1,
  NotesRepositoryV1,
  BookmarksRepositoryV1,
  ProfilesRepositoryV1,
};

export type { LocationModelV1 } from "./locations";
export type { CategoryModelV1 } from "./categories";
export type { CategoryFilterModelV1 } from "./categoryFilters";
export type { PresetModelV1 } from "./presets";
export type { PresetOrderModelV1 } from "./presetsOrdering";
export type { NoteModelV1 } from "./notes";
export type { BookmarkModelV1 } from "./bookmarks";
export type { ProfileModelV1 } from "./profiles";

export class Repositories {
  private readonly dexie: Dexie;

  public readonly locations: LocationsRepositoryV1;
  public readonly categories: CategoriesRepositoryV1;
  public readonly categoryFilters: CategoryFiltersRepositoryV1;
  public readonly presets: PresetsRepositoryV1;
  public readonly presetsOrdering: PresetsOrderingRepositoryV1;
  public readonly notes: NotesRepositoryV1;
  public readonly bookmarks: BookmarksRepositoryV1;
  public readonly profiles: ProfilesRepositoryV1;

  public constructor(dexie: Dexie) {
    this.dexie = dexie;

    this.locations = new LocationsRepositoryV1(dexie);
    this.categories = new CategoriesRepositoryV1(dexie);
    this.categoryFilters = new CategoryFiltersRepositoryV1(dexie);
    this.presets = new PresetsRepositoryV1(dexie);
    this.presetsOrdering = new PresetsOrderingRepositoryV1(dexie);
    this.notes = new NotesRepositoryV1(dexie);
    this.bookmarks = new BookmarksRepositoryV1(dexie);
    this.profiles = new ProfilesRepositoryV1(dexie);

    this.prepareStores();
  }

  private prepareStores() {
    this.dexie.version(1).stores({
      locations: this.locations.index,
      categories: this.categories.index,
      presets: this.presets.index,
      presetsOrdering: this.presetsOrdering.index,
      notes: this.notes.index,
      bookmarks: this.bookmarks.index,
      profiles: this.profiles.index,
    });

    // v2 adds the category show/hide filter store. Existing stores are
    // unchanged, so Dexie just creates the new one and keeps all current data.
    this.dexie.version(2).stores({
      categoryFilters: this.categoryFilters.index,
    });
  }
}
