export type AsyncProxy<T extends object> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : () => Promise<T[P]>;
};

export function createAsyncProxy<T extends object>(
  factory: () => Promise<T>
): AsyncProxy<T> {
  const targetPromise = factory();

  return new Proxy(
    {},
    {
      get: (_, prop: any) => {
        return async (...args: any[]) => {
          const target = await targetPromise;
          const member = Reflect.get(target, prop);

          if (typeof member === "function") {
            return member.apply(target, args);
          }
          return member;
        };
      },
    }
  ) as AsyncProxy<T>;
}
