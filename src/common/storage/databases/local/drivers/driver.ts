export interface Driver {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  has(key: string): Promise<boolean>;
  remove(key: string): Promise<void>;
}
