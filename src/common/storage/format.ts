export interface UserData {
  locations: Record<string, boolean>;
  trackedCategoryIds: number[];
  presets: MG.Preset[];
  presetOrdering: number[];
  notes: MG.Note[];
}

export function createEmptyUserData(): UserData {
  return {
    locations: {},
    trackedCategoryIds: [],
    presets: [],
    presetOrdering: [],
    notes: [],
  };
}
