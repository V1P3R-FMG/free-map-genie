import mapgenieApiService from "@/services/mapgenieApi.service";

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
  private readonly mapgenieApi = mapgenieApiService.use();

  public constructor(private readonly driver: Driver) {}

  private generateKey(gameId: number, mapId: number, userId: number): string {
    return `fmg:game_${gameId}:map_${mapId}:user_${userId}`;
  }

  public async hasData({ gameId, userId }: Key): Promise<boolean> {
    const game = await this.mapgenieApi.fetchGame(gameId);
    for (const map of game.maps) {
      const key = this.generateKey(gameId, map.id, userId);
      if (await this.driver.has(key)) {
        return true;
      }
    }
    return false;
  }

  public async getData({ gameId, userId }: Key): Promise<LocalV2Data> {
    const game = await this.mapgenieApi.fetchGame(gameId);

    const data: LocalV2Data = {};

    for (const map of game.maps) {
      const key = this.generateKey(gameId, map.id, userId);

      const json = await this.driver.get(key);

      if (json) {
        data[map.id] = JSON.parse(json);
      }
    }

    return data;
  }

  public async setData({ gameId, userId }: Key, data: LocalV2Data) {
    for (const mapIdStr in data) {
      const mapId = Number(mapIdStr);
      const v2MapData = data[mapIdStr];

      const key = this.generateKey(gameId, mapId, userId);

      await this.driver.set(key, JSON.stringify(v2MapData));
    }
  }

  public async upgrade(
    { gameId }: Key,
    legacyData: LocalV1Data
  ): Promise<LocalV2Data> {
    const migrator = new V1MigratorHelper(gameId);
    return migrator.migrate(legacyData);
  }
}
