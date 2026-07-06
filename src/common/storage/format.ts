import z from "zod";

export const Preset = z.object({
  id: z.number(),
  title: z.string(),
  order: z.number().optional(),
  categories: z.array(z.number()),
});

export const PresetOrder = z.array(z.number());

export const Note = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  color: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  category: z.any().nullable(),
  user_id: z.number(),
  map_id: z.number(),
  created_at: z.string(),
});

export const Checklist = z.record(z.string(), z.boolean());

export const UserDataSchema = z.object({
  locations: Checklist,
  trackedCategoryIds: z.array(z.number()),
  presets: z.array(Preset),
  presetOrdering: PresetOrder,
  notes: z.array(Note),
});

export type UserData = z.infer<typeof UserDataSchema>;

export function createEmptyUserData(): UserData {
  return {
    locations: {},
    trackedCategoryIds: [],
    presets: [],
    presetOrdering: [],
    notes: [],
  };
}
