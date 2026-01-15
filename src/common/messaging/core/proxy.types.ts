import type { MessengerOptions } from "./messengers/base";
import type { Adapter } from "./adapter";

export type PromisifyFunction<T extends (...args: any[]) => any> = T extends (
  ...args: infer A
) => infer R
  ? R extends Promise<any>
    ? (...args: A) => R
    : (...args: A) => Promise<R>
  : never;

export type Context = { new (...args: any[]): Record<string, any> };

export interface ProxyOptions<T extends Context> extends MessengerOptions {
  context: T;
}

export type ProxiedObject<T extends Record<string, any>> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any
    ? PromisifyFunction<T[K]>
    : never;
};

export type ProxyInstance<T extends Context> = ProxiedObject<InstanceType<T>>;

export type ProxyObject<T extends Context> = {
  provide: (
    adapter: Adapter,
    ...args: ConstructorParameters<T>
  ) => InstanceType<T>;
  use: (adapter: Adapter) => ProxyInstance<T>;
};

export type ProxyTarget<T extends ProxyObject<any>> = ReturnType<T["provide"]>;
