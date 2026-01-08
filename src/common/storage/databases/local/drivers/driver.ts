export interface Driver {
  get(key: string): Promise<string | null>;
  getBulk(keys: string[]): Promise<Record<string, string | null>>;
  set(key: string, value: string): Promise<void>;
  setBulk(map: Record<string, string>): Promise<void>;
  remove(key: string): Promise<void>;
  removeBulk(keys: string[]): Promise<void>;
  has(key: string): Promise<boolean>;
  hasBulk(keys: string[]): Promise<Record<string, boolean>>;
}
