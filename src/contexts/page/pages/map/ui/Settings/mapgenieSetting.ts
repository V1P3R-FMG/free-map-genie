export type ChangeListener<T> = (value: T | null) => void;

export class MapgenieSetting<T> {
  private readonly key: string;
  private readonly listeners: Set<ChangeListener<T>> = new Set();

  constructor(key: string) {
    this.key = key;
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

  private serialize(value: T): string {
    return JSON.stringify(value);
  }

  public setValue(value: T | null) {
    if (value === null) {
      localStorage.removeItem(this.key);
    } else {
      localStorage.setItem(this.key, this.serialize(value));
    }
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

  public static emitChange<T>(setting: MapgenieSetting<T>, value: string) {
    const parsedValue = setting.parse(value);
    setting.listeners.forEach((listener) => listener(parsedValue));
  }
}
