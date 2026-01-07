import { isValidMessage } from "./message";

import type { Message } from "./message";

type MaybePromise<T> = T | Promise<T>;

export type OffMessage = () => MaybePromise<void>;

export type OnMessageCallback = (message: any) => void;

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
