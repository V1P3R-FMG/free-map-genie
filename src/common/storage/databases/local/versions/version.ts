import type { UserData } from "../../../format";
import type { Key } from "../../../key";

export interface Version<T> {
  getData(key: Key): Promise<T>;
  setData(key: Key, data: T): Promise<void>;
  removeData(key: Key): Promise<void>;
  hasData(key: Key): Promise<boolean>;
  upgrade(key: Key, data: T): Promise<UserData> | UserData;
}
