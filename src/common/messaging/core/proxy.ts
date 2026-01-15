import { ProviderMessenger } from "./messengers/provider";
import { UserMessenger } from "./messengers/user";
import { MessengerOptions } from "./messengers/base";
import { getMemoizeOptions, applyMemoize } from "./memoize";

import type { Adapter } from "./adapter";
import type {
  Context,
  ProxyInstance,
  ProxiedObject,
  ProxyObject,
  ProxyOptions,
} from "./proxy.types";

export * from "./proxy.types";

const createProvider = <T extends Context, A extends ConstructorParameters<T>>(
  context: T,
  adapter: Adapter,
  options: Required<MessengerOptions>,
  args: A
) => {
  const target = new context(...args);
  const messenger = new ProviderMessenger(adapter, options);

  messenger.onMessage(async (message) => {
    switch (message.type) {
      case "ping":
        messenger.pong(message);
        break;
      case "invoke":
        try {
          const lastIndex = message.path.length - 1;
          const last = message.path[lastIndex];

          const obj = message.path
            .slice(0, -1)
            .reduce((acc, key) => acc[key], target);

          const value = obj[last];

          const data = await value.apply(obj, message.args ?? []);

          messenger.respondInvokeSuccess(message, data);
        } catch (err) {
          messenger.respondInvokeFail(message, err);
        }
        break;
    }
  });

  return target;
};

const createUser = <T extends Context>(
  context: T,
  adapter: Adapter,
  options: Required<MessengerOptions>
) => {
  const messenger = new UserMessenger(adapter, options);

  const createProxy = <U extends Record<string, any>>(
    target: any,
    path: string[]
  ) => {
    const memoizeOptions = getMemoizeOptions(target);

    return new Proxy((() => {}) as Record<string, any>, {
      get(f, key: string) {
        if (Reflect.has(target, key)) {
          return (f[key] ??= createProxy(target[key], [...path, key]));
        }
      },
      apply: applyMemoize(async (_target: any, _thisArg: any, args: any[]) => {
        if (options.heartbeatCheck) {
          await messenger.heartbeatCheck();
        }
        return messenger.invoke(path, args);
      }, memoizeOptions),
    }) as unknown as ProxiedObject<U>;
  };

  return createProxy<T>(context.prototype, []);
};

export const createProxy = <T extends Context>({
  context,
  ...options
}: ProxyOptions<T>) => {
  const fullOptions = {
    namespace: "__messaging__",
    heartbeatCheck: true,
    heartbeatInterval: 250,
    heartbeatTimeout: 10000,
    ...options,
  };

  return {
    provide(adapter: Adapter, ...args: ConstructorParameters<T>) {
      return createProvider(
        context,
        adapter,
        fullOptions,
        args
      ) as InstanceType<T>;
    },
    use(adapter: Adapter) {
      return createUser(context, adapter, fullOptions) as ProxyInstance<T>;
    },
  } satisfies ProxyObject<T>;
};
