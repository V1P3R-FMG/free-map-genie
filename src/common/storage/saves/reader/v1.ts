import { z } from "zod";
import { AbstractSaveReader, type JsonFile } from "./abstract";
import {
  LocalV1DataSchema,
  type LocalV1Data,
} from "../../databases/local/versions/v1.schema";
import { V1MigratorHelper } from "../../databases/local/versions/helpers/v1MigratorHelper";

const V1SaveLayoutSchema = z.object({
  version: z.string(),
  gameId: z.number(),
  userId: z.number(),
  storageObject: LocalV1DataSchema.optional(),
});

export type V1SaveLayout = z.infer<typeof V1SaveLayoutSchema>;

type V1SaveGroup = {
  gameId: number;
  userId: number;
  data: LocalV1Data;
  filenames: string[];
};

export class SaveReaderV1 extends AbstractSaveReader<
  typeof V1SaveLayoutSchema,
  V1SaveGroup
> {
  private readonly migrator = new V1MigratorHelper();

  protected readonly schema = V1SaveLayoutSchema;

  public read(group: V1SaveGroup) {
    const { gameId, userId, data, filenames } = group;

    try {
      const game = this.migrator.migrate(data);

      const games = { [gameId]: game };

      return {
        version: 1,
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

  public group(jsons: JsonFile<V1SaveLayout>[]) {
    const groups: V1SaveGroup[] = [];

    for (const json of jsons) {
      groups.push({
        gameId: json.content.gameId,
        userId: json.content.userId,
        data: json.content.storageObject || {},
        filenames: [json.filename],
      });
    }

    return groups;
  }

  public isSave(object: any): boolean {
    // v1 has a version field of v5 because we inherited the save format from an earlier project
    return typeof object === "object" && object?.version === "v5";
  }
}
