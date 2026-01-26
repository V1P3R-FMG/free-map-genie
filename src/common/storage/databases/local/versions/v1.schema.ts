import { z } from "zod";
import { Preset, PresetOrder, Checklist } from "../../../format";

export const LocalV1MapDataSchema = z.object({
  categories: Checklist.optional(),
  presets: z.record(z.string(), Preset).optional(),
  presets_order: PresetOrder.optional(),
  visible_categories: Checklist.optional(),
});

export const LocalV1SharedDataSchema = z.object({
  locations: Checklist.optional(),
});

export const LocalV1MapSettingsSchema = z.object({
  remember_categories: z.boolean().optional(),
});

export const LocalV1DataSchema = z.object({
  sharedData: LocalV1SharedDataSchema.optional(),
  mapData: z.record(z.string(), LocalV1MapDataSchema).optional(),
  settings: z.record(z.string(), LocalV1MapSettingsSchema).optional(),
});

export type LocalV1MapData = z.infer<typeof LocalV1MapDataSchema>;
export type LocalV1SharedData = z.infer<typeof LocalV1SharedDataSchema>;
export type LocalV1MapSettings = z.infer<typeof LocalV1MapSettingsSchema>;
export type LocalV1Data = z.infer<typeof LocalV1DataSchema>;
