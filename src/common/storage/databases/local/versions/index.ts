import { V1 } from "../versions/v1";
import { V2 } from "../versions/v2";

import type { Driver } from "../drivers/driver";
import type { Key } from "../../../key";

export * from "../versions/v1";
export * from "../versions/v2";

export class VersionManager {
  private readonly driver: Driver;
  private readonly v1: V1;
  private readonly v2: V2;

  public constructor(driver: Driver) {
    this.driver = driver;
    this.v1 = new V1(this.driver);
    this.v2 = new V2(this.driver);
  }

  private get migrationPath() {
    return [
      {
        from: this.v1,
        to: this.v2,
      },
    ];
  }

  private get latest() {
    return this.v2;
  }

  public async hasData(key: Key) {
    return this.latest.hasData(key);
  }

  public async getData(key: Key) {
    let data;

    for (const { from, to } of this.migrationPath) {
      // Check if data already exists in the 'to' version
      // If it does, skip migration
      if (await to.hasData(key)) continue;

      data ??= await from.getData(key);
      data = await to.upgrade(key, data);
    }

    if (data) {
      await this.latest.setData(key, data);
      return data;
    } else {
      return this.latest.getData(key);
    }
  }
}
