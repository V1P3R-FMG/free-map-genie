const WaitForPropSymbol = Symbol("WaitForProp");

interface TWithWaitForProp {
  [WaitForPropSymbol]?: Set<(value: any) => void>;
}

export class WaitForPropertyTimeoutError<
  T extends object,
  K extends keyof T
> extends Error {
  constructor(public readonly target: T, public readonly property: K) {
    super(`Timeout waiting for property ${String(property)}`);
  }
}

export const waitForProperty = <T extends object, K extends keyof T>(
  obj: T & TWithWaitForProp,
  prop: K,
  timeout = 10000
): Promise<T[K]> => {
  return new Promise<T[K]>((resolve, reject) => {
    const target = obj as TWithWaitForProp;

    if (prop in obj) {
      return resolve(obj[prop]);
    }

    if (timeout && timeout > 0) {
      setTimeout(() => {
        reject(new WaitForPropertyTimeoutError(obj, prop));
      }, timeout);
    }

    if (target[WaitForPropSymbol]) {
      target[WaitForPropSymbol]!.add(resolve);
      return;
    }

    target[WaitForPropSymbol] = new Set();
    target[WaitForPropSymbol]!.add(resolve);

    Object.defineProperty(obj, prop, {
      set(value: any) {
        // Notify all waiters
        target[WaitForPropSymbol]?.forEach((waiter) => waiter(value));

        // Redefine the property to be a normal property
        Object.defineProperty(obj, prop, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });

        // Clean up
        target[WaitForPropSymbol]?.clear();
        delete target[WaitForPropSymbol];
      },
      configurable: true,
      enumerable: true,
    });
  });
};
