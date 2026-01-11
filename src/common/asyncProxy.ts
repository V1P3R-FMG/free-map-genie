export type AsyncProxy<T extends object> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
    ? R extends Promise<any>
      ? (...args: A) => R
      : (...args: A) => Promise<R>
    : T[P] extends Promise<any>
    ? T[P]
    : Promise<T[P]>;
};

/**
 * Creates an asynchronous proxy for an object.
 * The members of the target object are accessed asynchronously.
 * Useful for creating async objects at class initialization time.
 * @param factory A function that returns a promise resolving to the target object.
 */
export function createAsyncProxy<T extends object>(
  factory: () => Promise<T>
): AsyncProxy<T> {
  const targetPromise = factory();

  return new Proxy({} as Record<string, () => Promise<any>>, {
    get: (self, prop: any) => {
      return (self[prop] ??= async (...args: any[]) => {
        const target = await targetPromise;
        const member = Reflect.get(target, prop);

        if (typeof member === "function") {
          return member.apply(target, args);
        }
        return member;
      });
    },
  }) as AsyncProxy<T>;
}
