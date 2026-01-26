import { Version } from "./version";
import { V2MigratorHelper } from "./helpers/v2MigratorHelper";

import type { LocalV2Data } from "./v2.schema";
import type { Driver } from "../drivers/driver";
import type { Key } from "../../../key";

export class V2 implements Version<LocalV2Data> {
  public constructor(private readonly driver: Driver) {}

  private generateKey(gameId: number, mapId: number, userId: number): string {
    return `fmg:game_${gameId}:map_${mapId}:user_${userId}`;
  }

  private isKeyForKey(key: string, { gameId, userId }: Key): boolean {
    return (
      key.startsWith(`fmg:game_${gameId}`) && key.endsWith(`:user_${userId}`)
    );
  }

  private filterKeysByKey(key: Key, keys: string[]): string[] {
    return keys.filter((k) => this.isKeyForKey(k, key));
  }

  private extractMapIdFromKey(key: string): number {
    const match = key.match(/:map_(\d+):user_/);
    if (!match) {
      throw new Error(`Invalid key format: ${key}`);
    }
    return Number(match[1]);
  }

  public async hasData(key: Key): Promise<boolean> {
    const keys = await this.driver.keys();

    return keys.some((k) => this.isKeyForKey(k, key));
  }

  public async getData(key: Key): Promise<LocalV2Data> {
    const keys = await this.driver.keys();
    const filteredKeys = this.filterKeysByKey(key, keys);

    const data: LocalV2Data = {};

    const storage = await this.driver.getBulk(filteredKeys);

    for (const key of filteredKeys) {
      const json = storage[key];

      if (json) {
        const mapId = this.extractMapIdFromKey(key);
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
    const keys = await this.driver.keys();
    const filteredKeys = this.filterKeysByKey({ gameId, userId }, keys);
    await this.driver.removeBulk(filteredKeys);
  }

  public async upgrade({}: Key, legacyData: LocalV2Data) {
    const migrator = new V2MigratorHelper();
    return migrator.migrate(legacyData);
  }
}
