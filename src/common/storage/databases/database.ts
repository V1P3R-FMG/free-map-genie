import type { Key } from "../key";
import type { UserData } from "../format";

export interface Database {
  open(): Promise<void>;
  close(): Promise<void>;

  hasData(key: Key): Promise<boolean>;
  setData(key: Key, data: UserData): Promise<void>;
  getData(key: Key): Promise<UserData>;
  removeData(key: Key): Promise<void>;
}
