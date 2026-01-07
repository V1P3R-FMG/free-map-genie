import type { MessengerOptions } from "./messengers/base";
import type { Adapter } from "./adapter";

export type PromisifyFunction<T extends (...args: any[]) => any> = T extends (
  ...args: infer A
) => infer R
  ? R extends Promise<any>
    ? (...args: A) => R
    : (...args: A) => Promise<R>
  : never;

export interface ProxyOptions<T extends Record<string, any>>
  extends MessengerOptions {
  context: () => T;
}

export type ProxiedObject<S extends Record<string, any>> = {
  [K in keyof S]: S[K] extends (...args: any[]) => any
    ? PromisifyFunction<S[K]>
    : never;
};

export type ProxyObject<T extends Record<string, any>> = {
  provide: (adapter: Adapter) => T;
  use: (adapter: Adapter) => ProxiedObject<T>;
};

export type ProxyTarget<T extends ProxyObject<any>> = ReturnType<T["provide"]>;
