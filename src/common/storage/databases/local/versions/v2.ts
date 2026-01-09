import mapgenieService from "@/services/mapgenie.service";

import { Version } from "./version";
import { Driver } from "../drivers/driver";
import { Key } from "../../../key";
import { V1MigratorHelper } from "./helpers/v1MigratorHelper";

import type { LocalV1Data } from "./v1";

export interface LocalV2MapData {
  locationIds?: number[];
  categoryIds?: number[];
  visibleCategoriesIds?: number[];
  notes?: MG.Note[];
  presets?: MG.Preset[];
  presetOrder?: number[];
}

export interface LocalV2Data {
  [mapId: string]: LocalV2MapData;
}

export class V2 implements Version<LocalV2Data, LocalV1Data> {
  private readonly mapgenie = mapgenieService.use();

  public constructor(private readonly driver: Driver) {}

  private generateKey(gameId: number, mapId: number, userId: number): string {
    return `fmg:game_${gameId}:map_${mapId}:user_${userId}`;
  }

  public async hasData({ gameId, userId }: Key): Promise<boolean> {
    const keys = await this.driver.keys();

    return keys.some(
      (key) =>
        key.startsWith(`fmg:game_${gameId}`) && key.endsWith(`:user_${userId}`)
    );
  }

  public async getData({ gameId, userId }: Key): Promise<LocalV2Data> {
    const { maps } = await this.mapgenie.fetchGame(gameId);

    const data: LocalV2Data = {};

    const keysMap = Object.fromEntries(
      maps.map((map) => [this.generateKey(gameId, map.id, userId), map.id])
    );

    const storage = await this.driver.getBulk(Object.keys(keysMap));

    for (const key in storage) {
      const json = storage[key];

      if (json) {
        const mapId = keysMap[key];
        data[mapId] = JSON.parse(json);
      }
    }

    return data;
  }

  public async setData({ gameId, userId }: Key, data: LocalV2Data) {
    const maps: Record<string, string> = {};

    for (const mapIdStr in data) {
      const mapId = Number(mapIdStr);
      const v2MapData = data[mapIdStr];

      const key = this.generateKey(gameId, mapId, userId);

      maps[key] = JSON.stringify(v2MapData);
    }

    await this.driver.setBulk(maps);
  }

  public async removeData({ gameId, userId }: Key): Promise<void> {
    const { maps } = await this.mapgenie.fetchGame(gameId);

    const keys = maps.map((map) => this.generateKey(gameId, map.id, userId));

    await this.driver.removeBulk(keys);
  }

  public async upgrade(
    { gameId }: Key,
    legacyData: LocalV1Data
  ): Promise<LocalV2Data> {
    const migrator = new V1MigratorHelper(gameId);
    return migrator.migrate(legacyData);
  }
}
