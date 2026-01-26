import { z } from "zod";
import { AbstractSaveReader, type JsonFile } from "./abstract";
import { UserDataSchema } from "../../format";

import type { UserData } from "../../format";

const ExportedUserDataSchema = UserDataSchema.extend({
  locations: z.array(z.number()),
});

export type ExportedUserData = z.infer<typeof ExportedUserDataSchema>;

const V3SaveLayoutSchema = z.object({
  version: z.number(),
  userId: z.number(),
  createdAt: z.string(),
  games: z.record(z.string(), ExportedUserDataSchema).optional(),
});

export type V3SaveLayout = z.infer<typeof V3SaveLayoutSchema>;

type V3SaveGroup = {
  userId: number;
  games: Record<number, UserData>;
  filenames: string[];
};

export class SaveReaderV3 extends AbstractSaveReader<
  typeof V3SaveLayoutSchema,
  V3SaveGroup
> {
  protected readonly schema = V3SaveLayoutSchema;

  public read(group: V3SaveGroup) {
    const { userId, games, filenames } = group;

    return {
      version: 3,
      userId,
      games,
      filenames,
    };
  }

  private parseGame(data: ExportedUserData): UserData {
    return {
      ...data,
      locations: Object.fromEntries(data.locations.map((loc) => [loc, true])),
    };
  }

  private parseGames(
    games?: Record<string, ExportedUserData>
  ): Record<Id, UserData> {
    if (!games) return {};

    return Object.fromEntries(
      Object.entries(games).map(([gameId, data]) => [
        gameId,
        this.parseGame(data),
      ])
    );
  }

  public group(jsons: JsonFile<V3SaveLayout>[]) {
    const groups: V3SaveGroup[] = [];

    for (const json of jsons) {
      groups.push({
        userId: json.content.userId,
        games: this.parseGames(json.content.games),
        filenames: [json.filename],
      });
    }

    return groups;
  }

  public isSave(object: any): boolean {
    return typeof object === "object" && object?.version === 3;
  }
}
