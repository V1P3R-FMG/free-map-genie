import { z } from "zod";
import { AbstractSaveReader, type JsonFile } from "./abstract";
import {
  LocalV2MapDataSchema,
  type LocalV2Data,
} from "../../databases/local/versions/v2.schema";
import { V2MigratorHelper } from "../../databases/local/versions/helpers/v2MigratorHelper";

const V2SaveLayoutSchema = z.object({
  version: z.number(),
  gameId: z.number(),
  userId: z.number(),
  mapId: z.number(),
  data: LocalV2MapDataSchema.optional(),
});

export type V2SaveLayout = z.infer<typeof V2SaveLayoutSchema>;

type V2SaveGroup = {
  gameId: number;
  userId: number;
  data: LocalV2Data;
  filenames: string[];
};

export class SaveReaderV2 extends AbstractSaveReader<
  typeof V2SaveLayoutSchema,
  V2SaveGroup
> {
  private readonly migrator = new V2MigratorHelper();

  protected readonly schema = V2SaveLayoutSchema;

  public read(group: V2SaveGroup) {
    const { gameId, userId, data, filenames } = group;

    try {
      const game = this.migrator.migrate(data);

      const games = { [gameId]: game };

      return {
        version: 2,
        userId,
        games,
        filenames,
      };
    } catch (err) {
      group.filenames.forEach((filename) => {
        this.reporter.error(filename, err);
      });
      return null;
    }
  }

  public group(jsons: JsonFile<V2SaveLayout>[]) {
    const groups: Record<string, V2SaveGroup> = {};

    for (const json of jsons) {
      const { gameId, userId, mapId, data } = json.content;

      const key = `${gameId}::${userId}`;

      groups[key] ??= {
        gameId,
        userId,
        data: {},
        filenames: [],
      };

      if (groups[key].data[mapId]) {
        this.reporter.error(
          json.filename,
          `Duplicate save file for gameId ${gameId}, userId ${userId}, mapId ${mapId}.`
        );
        groups[key].filenames.push(json.filename);
        continue;
      }

      groups[key].data[mapId] = data || {};
      groups[key].filenames.push(json.filename);
    }

    return Object.values(groups);
  }

  public isSave(object: any): boolean {
    return typeof object === "object" && object?.version === 2;
  }
}
