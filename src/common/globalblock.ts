export class GlobalBlock<T = any> {
  private _value?: T;
  private blocked = true;
  private onBlockedCallbacks: Set<() => void> = new Set();

  constructor(name: string) {
    this._value = (window as any)[name];
    Object.defineProperty(window, name, {
      get: () => {
        if (this.blocked) {
          this.onBlockedCallbacks.forEach((cb) => cb());
          throw new Error(`Global "${name}" is blocked`);
        }
        return this._value;
      },
      set: (value: T) => {
        this._value = value;
      },
    });
  }

  public get isBlocked() {
    return this.blocked;
  }

  public unblock() {
    this.blocked = false;
  }

  public block() {
    this.blocked = true;
  }

  public onBlocked(callback: () => void) {
    this.onBlockedCallbacks.add(callback);
  }

  public offBlocked(callback: () => void) {
    this.onBlockedCallbacks.delete(callback);
  }

  public get value() {
    return this._value;
  }
}
