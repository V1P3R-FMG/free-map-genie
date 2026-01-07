import { createLocationsById } from "@/common/mapgenie/mapData";
import mapgenieApiService from "@/services/mapgenieApi.service";

import type { V1Data, V1GameData, V1MapData } from "../v1";
import type { V2Data, V2MapData } from "../v2";

export class V1MigratorHelper {
  private readonly mapgenieApi = mapgenieApiService.use();
  private readonly gameId: number;

  private _game?: MG.Api.GameFull;

  public constructor(gameId: number) {
    this.gameId = gameId;
  }

  private async getGame(): Promise<MG.Api.GameFull> {
    return (this._game ??= await this.mapgenieApi.fetchGame(this.gameId));
  }

  private migrateBooleanMapToArray(
    booleanMap: Record<number, boolean>
  ): number[] {
    return Object.keys(booleanMap).map(Number);
  }

  private async migrateLocations(
    mapId: number,
    legacyGameData: V1GameData,
    data: V2MapData
  ) {
    const game = await this.getGame();

    const locationsById = await this.getLocationsById(game, mapId);

    const locationIds: number[] = [];

    for (const locIdStr in legacyGameData.locations) {
      const locId = Number(locIdStr);
      if (locationsById[locId]) {
        locationIds.push(locId);
      }
    }

    if (locationIds.length > 0) {
      data.locationIds = locationIds;
    }
  }

  private migrateCategories(legacyMapData: V1MapData, data: V2MapData) {
    if (legacyMapData.visible_categories) {
      data.visibleCategoriesIds = this.migrateBooleanMapToArray(
        legacyMapData.visible_categories
      );
    }
  }

  private migratePresets(legacyMapData: V1MapData, data: V2MapData) {
    if (legacyMapData.presets) {
      data.presets = Object.values(legacyMapData.presets);
    }
    if (legacyMapData.presets_order) {
      data.presetOrder = legacyMapData.presets_order;
    }
  }

  private async getLocationsById(game: MG.Api.GameFull, mapId: number) {
    const map = game.maps.find((m) => m.id === mapId);
    if (!map) throw new Error("Map not found: " + mapId);

    return createLocationsById(map);
  }

  private async migrateMapData(
    mapId: number,
    legacyData: V1Data,
    data: V2Data
  ) {
    const v1MapData = legacyData.mapData?.[mapId] ?? {};
    const v1GameData = legacyData.sharedData ?? {};

    const v2MapData: V2MapData = {};

    await this.migrateLocations(mapId, v1GameData, v2MapData);

    this.migrateCategories(v1MapData, v2MapData);
    this.migratePresets(v1MapData, v2MapData);

    // Only add map data if there is at least one field
    for (const _ in v2MapData) {
      data[mapId] = v2MapData;
      break;
    }
  }

  public async migrate(legacyData: V1Data): Promise<V2Data> {
    const data: V2Data = {};

    for (const mapIdStr in legacyData.mapData) {
      const mapId = Number(mapIdStr);
      await this.migrateMapData(mapId, legacyData, data);
    }

    return data;
  }
}
