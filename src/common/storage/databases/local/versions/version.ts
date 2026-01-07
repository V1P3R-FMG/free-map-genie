import type { Key } from "../../../key";

export interface Version<T, P> {
  getData(key: Key): Promise<T>;
  setData(key: Key, data: T): Promise<void>;
  hasData(key: Key): Promise<boolean>;
  upgrade(key: Key, data: P): Promise<T> | T;
}
