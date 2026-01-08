import { LocalStorageDriver } from "./drivers/local";
import { VersionManager } from "./versions";

import type { Database } from "../database";
import type { Driver } from "./drivers/driver";
import type { Key } from "../../key";
import type { UserData } from "../../format";

// Legacy storage
// fmg@v1 - fmg@v2
export class LocalDatabase implements Database {
  private readonly driver: Driver;
  private readonly versionManager: VersionManager;

  public constructor(domain: string) {
    this.driver = new LocalStorageDriver(domain);
    this.versionManager = new VersionManager(this.driver);
  }

  public async open(): Promise<void> {}
  public async close(): Promise<void> {}

  public async hasData(key: Key): Promise<boolean> {
    return this.versionManager.hasData(key);
  }

  public async getData(key: Key) {
    const data = await this.versionManager.getData(key);

    const locationIds = new Set<number>();
    const trackedCategoryIds = new Set<number>();

    for (const mapData of Object.values(data)) {
      mapData.locationIds?.forEach((id) => locationIds.add(id));
      mapData.categoryIds?.forEach((id) => trackedCategoryIds.add(id));
    }

    const locations = Object.fromEntries(
      Array.from(locationIds).map((id) => [id.toString(), true])
    );

    return {
      locations,
      trackedCategoryIds: Array.from(trackedCategoryIds),
    };
  }

  public async setData(key: Key, data: UserData): Promise<void> {
    throw new Error("Method not implemented.");
  }

  public async removeData(key: Key): Promise<void> {
    return this.versionManager.removeData(key);
  }
}
