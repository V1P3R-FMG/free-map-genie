import { isValidMessage } from "./message";

import type { Message } from "./message";

type MaybePromise<T> = T | Promise<T>;

export type OffMessage = () => MaybePromise<void>;

export type OnMessageCallback = (message: any) => void;

export type GlobalThisWithAdapter = typeof globalThis & {
  [GlobalAdapter]: Adapter | undefined;
};

const GlobalAdapter = Symbol("GlobalAdapter");

export abstract class Adapter<M extends Message = Message> {
  abstract sendMessage(message: M): MaybePromise<void>;

  abstract onMessage(
    callback: OnMessageCallback
  ): MaybePromise<OffMessage | void>;

  abstract disconnect(): void;

  public isValidMessage(message: any): message is M {
    return isValidMessage(message);
  }
}

export const setGlobalAdapter = (adapter: Adapter) => {
  return ((globalThis as GlobalThisWithAdapter)[GlobalAdapter] = adapter);
};

export const getGlobalAdapter = (): Adapter => {
  const adapter = (globalThis as GlobalThisWithAdapter)[GlobalAdapter];
  if (!adapter) {
    throw new Error(
      "Global adapter is not set, please import one of the contexts first."
    );
  }
  return adapter;
};
