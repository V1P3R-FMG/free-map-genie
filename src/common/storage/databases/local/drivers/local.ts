import storageService from "@/services/storage.service";
import type { Driver } from "./driver";

export class LocalStorageDriver implements Driver {
  private _storage?: storageService.Instance;

  public constructor(private readonly domain: string) {}

  private async getStorage() {
    return (this._storage ??= await storageService.use(this.domain));
  }

  public async get(key: string): Promise<string | null> {
    const storage = await this.getStorage();
    return storage.get(key);
  }

  public async getBulk(keys: string[]): Promise<Record<string, string | null>> {
    const storage = await this.getStorage();
    return storage.getBulk(keys);
  }

  public async set(key: string, value: string): Promise<void> {
    const storage = await this.getStorage();
    return storage.set(key, value);
  }

  public async setBulk(map: Record<string, string>): Promise<void> {
    const storage = await this.getStorage();
    return storage.setBulk(map);
  }

  public async remove(key: string): Promise<void> {
    const storage = await this.getStorage();
    return storage.remove(key);
  }

  public async removeBulk(keys: string[]): Promise<void> {
    const storage = await this.getStorage();
    return storage.removeBulk(keys);
  }

  public async has(key: string): Promise<boolean> {
    const storage = await this.getStorage();
    return storage.has(key);
  }

  public async hasBulk(keys: string[]): Promise<Record<string, boolean>> {
    const storage = await this.getStorage();
    return storage.hasBulk(keys);
  }
}
