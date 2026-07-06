import { Version } from "./version";
import { V1MigratorHelper } from "./helpers/v1MigratorHelper";

import type { LocalV1Data } from "./v1.schema";
import type { Driver } from "../drivers/driver";
import type { Key } from "../../../key";

export class V1 implements Version<LocalV1Data> {
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

  public upgrade({}: Key, data: LocalV1Data) {
    const migrator = new V1MigratorHelper();
    return migrator.migrate(data);
  }
}
