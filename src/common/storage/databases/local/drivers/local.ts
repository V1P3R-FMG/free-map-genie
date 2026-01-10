import type { Driver } from "./driver";

export class LocalStorageDriver implements Driver {
  public async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  public async getBulk(keys: string[]): Promise<Record<string, string | null>> {
    const result: Record<string, string | null> = {};
    for (const key of keys) {
      result[key] = localStorage.getItem(key);
    }
    return result;
  }

  public async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  public async setBulk(map: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(map)) {
      localStorage.setItem(key, value);
    }
  }

  public async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  public async removeBulk(keys: string[]): Promise<void> {
    for (const key of keys) {
      localStorage.removeItem(key);
    }
  }

  public async has(key: string): Promise<boolean> {
    return localStorage.getItem(key) !== null;
  }

  public async hasBulk(keys: string[]): Promise<Record<string, boolean>> {
    const result: Record<string, boolean> = {};
    for (const key of keys) {
      result[key] = localStorage.getItem(key) !== null;
    }
    return result;
  }

  public async hasAny(keys: string[]): Promise<boolean> {
    for (const key of keys) {
      if (localStorage.getItem(key) !== null) {
        return true;
      }
    }
    return false;
  }

  public async keys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
}
