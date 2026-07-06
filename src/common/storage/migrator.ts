import { LocalDatabase, DexieDatabase } from "./databases";

import type { Key } from "./key";

export class Migrator {
  private readonly domains = new Map<string, LocalDatabase>();
  private readonly dexie = new DexieDatabase();

  public async migrate(domain: string, key: Key) {
    const local = this.getDomainDatabase(domain);

    if (await local.hasData(key)) {
      const data = await local.getData(key);
      await this.dexie.setData(key, data);
      await local.removeData(key);
    }
  }

  private getDomainDatabase(domain: string) {
    let database = this.domains.get(domain);
    if (!database) {
      database = new LocalDatabase(domain);
      this.domains.set(domain, database);
    }
    return database;
  }
}
