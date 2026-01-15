import { createProxy } from "./core/proxy";

import type { Adapter } from "./core/adapter";
import type { Context, ProxyOptions } from "./core/proxy.types";

export type { Adapter } from "./core/adapter";
export type * from "./core/proxy.types";

export { Memoize } from "./core/memoize";

export type { Options as MemoizeOptions } from "p-memoize";

declare global {
  var __ADAPTER__: Adapter;
}

export const createService = <T extends Context>(options: ProxyOptions<T>) => {
  const proxy = createProxy(options);

  const use = () => {
    return proxy.use(globalThis.__ADAPTER__);
  };

  const provide = (...args: ConstructorParameters<T>) => {
    return proxy.provide(globalThis.__ADAPTER__, ...args);
  };

  return { use, provide };
};
