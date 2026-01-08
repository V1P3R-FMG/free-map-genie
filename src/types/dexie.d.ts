module "dexie" {
  export * from "dexie";

  export type CollectionForTable<T extends Table<any, any, any>> = ReturnType<
    T["toCollection"]
  >;

  export interface Dexie {
    transaction<U>(
      mode: TransactionMode,
      table0: string | Table,
      table1: string | Table,
      table2: string | Table,
      table3: string | Table,
      table4: string | Table,
      table5: string | Table,
      scope: (trans: TXWithTables<this>) => PromiseLike<U> | U
    ): PromiseExtended<U>;
  }

  export default Dexie;
}

export {};
