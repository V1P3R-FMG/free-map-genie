import { Table } from "dexie";

module "dexie" {
  export * from "dexie";

  export type CollectionForTable<T extends Table<any, any, any>> = ReturnType<
    T["toCollection"]
  >;

  export interface Dexie {
    transaction<U>(
      mode: TransactionMode,
      table1: string | Table,
      table2: string | Table,
      table3: string | Table,
      table4: string | Table,
      table5: string | Table,
      scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
    ): PromiseExtended<U>;
  }

  export type TableEntity<T extends Table> =
    T extends Table<infer E, any, any> ? E : never;

  export default Dexie;
}

export {};
