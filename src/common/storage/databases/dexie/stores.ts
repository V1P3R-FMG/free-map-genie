import type {
  LocationsTableV1,
  TrackedCategoriesTableV1,
  NotesTableV1,
  PresetsTableV1,
  PresetsOrderingTableV1,
} from "./versions/v1";

export type Stores = {
  locations: LocationsTableV1;
  trackedCategories: TrackedCategoriesTableV1;
  notes: NotesTableV1;
  presets: PresetsTableV1;
  presetsOrdering: PresetsOrderingTableV1;
};
