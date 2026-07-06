import type Dexie from "dexie";

export abstract class AbstractRepository<T, TKey, TInsertType = T> {
  protected readonly dexie: Dexie;

  public abstract readonly tableName: string;
  public abstract readonly index: string;

  public constructor(dexie: Dexie) {
    this.dexie = dexie;
  }

  public get table() {
    return this.dexie.table<T, TKey, TInsertType>(this.tableName);
  }

  private sanitizeCriteria(criteria: Partial<T>) {
    return Object.fromEntries(
      Object.entries(criteria).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
  }

  public async export(criteria: Partial<T>) {
    return this.table.where(this.sanitizeCriteria(criteria)).toArray();
  }
}

export type RepositoryEntity<T> =
  T extends AbstractRepository<infer U, any, any> ? U : never;
