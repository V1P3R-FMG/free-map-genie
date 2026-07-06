const PropertyObserverSymbol = Symbol.for("PropertyObserver");

export class PropertyObserverTimeoutError<
  T extends object,
  K extends keyof T,
> extends Error {
  constructor(
    public readonly target: T,
    public readonly property: K
  ) {
    super(`Timeout waiting for property ${String(property)}`);
  }
}

type Listeners = Set<(value: any) => void>;

export class PropertyObserver<T extends object> {
  private readonly observers = new Map<PropertyKey, Listeners>();

  private readonly target: T;

  private constructor(target: T) {
    this.target = target;
  }

  public static attach(target: {
    [PropertyObserverSymbol]?: PropertyObserver<any>;
  }) {
    return (target[PropertyObserverSymbol] ??= new this(target));
  }

  public observe<K extends keyof T>(prop: K, cb: (value: T[K]) => void) {
    if (!this.observers.has(prop)) {
      if (prop in this.target) {
        cb(this.target[prop]);
        return;
      } else {
        this.attachObserver(prop);
      }
    }

    this.observers.get(prop)!.add(cb);
  }

  private attachObserver<K extends keyof T>(prop: K) {
    const listeners = new Set<(value: any) => void>();

    this.observers.set(prop, listeners);

    Object.defineProperty(this.target, prop, {
      set: (value: any) => {
        // Notify all waiters
        listeners.forEach((cb) => cb(value));

        // Remove listeners for prop
        listeners.clear();
        this.observers.delete(prop);

        // Redefine the property to be a normal property
        Object.defineProperty(this.target, prop, {
          value,
          writable: true,
          enumerable: false,
          configurable: true,
        });
      },
      configurable: true,
      enumerable: true,
    });
  }
}

export const waitForProperty = <T extends object, K extends keyof T>(
  target: T,
  prop: K,
  timeout = 10000
): Promise<T[K]> => {
  return new Promise<T[K]>((resolve, reject) => {
    let handle: number | null = null;
    if (timeout && timeout > 0) {
      handle = window.setTimeout(() => {
        reject(new PropertyObserverTimeoutError(target, prop));
      }, timeout);
    }

    const observer = PropertyObserver.attach(target);

    observer.observe(prop, (value) => {
      handle && window.clearTimeout(handle);
      resolve(value);
    });
  });
};
