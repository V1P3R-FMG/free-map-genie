import { MapgenieSetting } from "./mapgenieSetting";

export type StringLike = string | number | boolean | null | undefined;

export type KeyPart = string | [string, StringLike];

export { MapgenieSetting };

export class MapgenieSettings {
  private readonly settings: Map<string, MapgenieSetting<any>> = new Map();

  public constructor() {
    window.addEventListener("storage", (event) => {
      if (event.key?.startsWith("mg:settings:")) {
        const setting = this.settings.get(event.key);
        if (setting) {
          MapgenieSetting.emitChange(setting, event.newValue ?? "null");
        }
      }
    });
  }

  public get<T>(...keys: KeyPart[]): MapgenieSetting<T> {
    const key = this.createKey(keys);
    if (!this.settings.has(key)) {
      this.settings.set(key, new MapgenieSetting<T>(key));
    }
    return this.settings.get(key)!;
  }

  private createKey(keys: KeyPart[]) {
    const metaString = keys
      .map((key) => (Array.isArray(key) ? `${key[0]}_${key[1]}` : key))
      .join(":");

    return `mg:settings:` + metaString;
  }
}
