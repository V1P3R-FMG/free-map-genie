import { Version } from "./version";
import { Driver } from "../drivers/driver";
import { Key } from "../../../key";

export interface LocalV1GameData {
  locations?: Record<string, boolean>;
}

export interface LocalV1MapData {
  categories?: Record<string, boolean>;
  presets?: Record<string, MG.Preset>;
  presets_order?: number[];
  visible_categories?: Record<string, boolean>;
}

export interface LocalV1MapSettings {
  remember_categories?: boolean;
}

export interface LocalV1Data {
  sharedData?: LocalV1GameData;
  mapData?: Record<string, LocalV1MapData>;
  settings?: Record<string, LocalV1MapSettings>;
}

export class V1 implements Version<LocalV1Data, void> {
  public constructor(private readonly driver: Driver) {}

  private generateKey(gameId: number, userId: number): string {
    return `mg:game_${gameId}:user_${userId}:v5`;
  }

  public async hasData({ gameId, userId }: Key): Promise<boolean> {
    const key = this.generateKey(gameId, userId);
    return this.driver.has(key);
  }

  public async getData({ gameId, userId }: Key): Promise<LocalV1Data> {
    const key = this.generateKey(gameId, userId);

    const json = await this.driver.get(key);
    return json ? JSON.parse(json) : {};
  }

  public async removeData({ gameId, userId }: Key): Promise<void> {
    const key = this.generateKey(gameId, userId);
    await this.driver.remove(key);
  }

  public async setData(
    { gameId, userId }: Key,
    data: LocalV1Data
  ): Promise<void> {
    const key = this.generateKey(gameId, userId);

    await this.driver.set(key, JSON.stringify(data));
  }

  public upgrade({}: Key, _data: void): LocalV1Data {
    throw new Error("No previous version to upgrade from");
  }
}
