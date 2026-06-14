export type ChangeListener<T> = (value: T | null) => void;

export type StringLike = string | number | boolean | null | undefined;

export type KeyPart = string | [string, StringLike];

export class StorageEntry<T> {
  private readonly key: string;
  private readonly listeners: Set<ChangeListener<T>> = new Set();

  private static entries: Map<string, StorageEntry<any>> = new Map();

  private constructor(key: string) {
    this.key = key;

    window.addEventListener("storage", (event) => {
      if (event.key === this.key) {
        this.emitChange(event.newValue ?? "null");
      }
    });
  }

  private static createKey(keys: KeyPart[]) {
    const metaString = keys
      .map((key) => (Array.isArray(key) ? `${key[0]}_${key[1]}` : key))
      .join(":");

    return `mg:settings:` + metaString;
  }

  public static get<T>(...keys: KeyPart[]): StorageEntry<T> {
    const key = this.createKey(keys);

    if (!StorageEntry.entries.has(key)) {
      StorageEntry.entries.set(key, new StorageEntry<T>(key));
    }

    return StorageEntry.entries.get(key)!;
  }

  public get value(): T | null {
    return JSON.parse(localStorage.getItem(this.key) ?? "null");
  }

  public set value(value: T | null) {
    this.setValue(value);
  }

  private parse(value: string | null): T | null {
    return value === null ? null : JSON.parse(value);
  }

  private serialize(value: T | null): string {
    return JSON.stringify(value);
  }

  public setValue(value: T | null) {
    if (value === null) {
      localStorage.removeItem(this.key);
    } else {
      localStorage.setItem(this.key, this.serialize(value));
    }
    this.emitChange(this.serialize(value));
  }

  public onChange(listener: ChangeListener<T>) {
    this.listeners.add(listener);
  }

  public offChange(listener: ChangeListener<T>) {
    this.listeners.delete(listener);
  }

  public set change(listener: ChangeListener<T>) {
    this.onChange(listener);
  }

  private emitChange(value: string) {
    const parsedValue = this.parse(value);
    this.listeners.forEach((listener) => listener(parsedValue));
  }
}
