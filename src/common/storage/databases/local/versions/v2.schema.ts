import z from "zod";
import { Preset, Note } from "../../../format";

export const LocalV2Note = Note.extend({
  created_at: z.string().optional(),
});

export const LocalV2MapDataSchema = z.object({
  locationIds: z.array(z.number()).optional(),
  categoryIds: z.array(z.number()).optional(),
  visibleCategoriesIds: z.array(z.number()).optional(),
  notes: z.array(LocalV2Note).optional(),
  presets: z.array(Preset).optional(),
  presetOrder: z.array(z.number()).optional(),
});

export const LocalV2DataSchema = z.record(z.string(), LocalV2MapDataSchema);

export type LocalV2MapData = z.infer<typeof LocalV2MapDataSchema>;
export type LocalV2Data = z.infer<typeof LocalV2DataSchema>;
