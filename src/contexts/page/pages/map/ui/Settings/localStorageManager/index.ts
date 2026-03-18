import { SavedEntry } from "./savedEntry";

export type StringLike = string | number | boolean | null | undefined;

export type KeyPart = string | [string, StringLike];

export { SavedEntry };

export class LocalStorageManager {
  private readonly saves: Map<string, SavedEntry<any>> = new Map();

  public constructor() {
    window.addEventListener("storage", (event) => {
      if (event.key?.startsWith("mg:settings:")) {
        const setting = this.saves.get(event.key);
        if (setting) {
          SavedEntry.emitChange(setting, event.newValue ?? "null");
        }
      }
    });
  }

  public get<T>(...keys: KeyPart[]): SavedEntry<T> {
    const key = this.createKey(keys);
    if (!this.saves.has(key)) {
      this.saves.set(key, new SavedEntry<T>(key));
    }
    return this.saves.get(key)!;
  }

  private createKey(keys: KeyPart[]) {
    const metaString = keys
      .map((key) => (Array.isArray(key) ? `${key[0]}_${key[1]}` : key))
      .join(":");

    return `mg:settings:` + metaString;
  }
}
