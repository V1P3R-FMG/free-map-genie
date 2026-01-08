export interface UserData {
  locations: Record<string, boolean>;
  trackedCategoryIds: number[];
  presets: MG.Preset[];
  presetOrdering: number[];
  notes: MG.Note[];
}
