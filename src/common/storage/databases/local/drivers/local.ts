import storageService from "@/services/storage.service";
import { createAsyncProxy } from "@/common/asyncProxy";

import type { Driver } from "./driver";
import type { AsyncProxy } from "@/common/asyncProxy";

export class LocalStorageDriver implements Driver {
  private storage: AsyncProxy<storageService.Instance>;

  public constructor(domain: string) {
    this.storage = createAsyncProxy(() => storageService.use(domain));
  }

  public async get(key: string): Promise<string | null> {
    return this.storage.get(key);
  }

  public async getBulk(keys: string[]): Promise<Record<string, string | null>> {
    return this.storage.getBulk(keys);
  }

  public async set(key: string, value: string): Promise<void> {
    return this.storage.set(key, value);
  }

  public async setBulk(map: Record<string, string>): Promise<void> {
    return this.storage.setBulk(map);
  }

  public async remove(key: string): Promise<void> {
    return this.storage.remove(key);
  }

  public async removeBulk(keys: string[]): Promise<void> {
    return this.storage.removeBulk(keys);
  }

  public async has(key: string): Promise<boolean> {
    return this.storage.has(key);
  }

  public async hasBulk(keys: string[]): Promise<Record<string, boolean>> {
    return this.storage.hasBulk(keys);
  }

  public async hasAny(keys: string[]): Promise<boolean> {
    return this.storage.hasAny(keys);
  }

  public async keys(): Promise<string[]> {
    return this.storage.keys();
  }
}
