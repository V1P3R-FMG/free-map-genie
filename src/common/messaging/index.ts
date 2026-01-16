import { createProxy } from "./core/proxy";

import { getGlobalAdapter } from "./core/adapter";
import type { Context, ProxyOptions } from "./core/proxy.types";

export type { Adapter } from "./core/adapter";
export type * from "./core/proxy.types";

export { Memoize } from "./core/memoize";

export type { Options as MemoizeOptions } from "p-memoize";

export const createService = <T extends Context>(options: ProxyOptions<T>) => {
  const proxy = createProxy(options);

  const use = () => {
    const adapter = getGlobalAdapter();
    return proxy.use(adapter);
  };

  const provide = (...args: ConstructorParameters<T>) => {
    const adapter = getGlobalAdapter();
    return proxy.provide(adapter, ...args);
  };

  return { use, provide };
};
