import { nanoid } from "nanoid";
import { isValidMessage } from "../message";

import type { Adapter } from "../adapter";
import type { Message, MessageSender, MessageType } from "../message";

export interface MessengerOptions {
  namespace?: string;
  heartbeatCheck?: boolean;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
}

type CreateMessageOptions = Partial<
  Pick<Message, "id" | "path" | "args" | "data" | "error">
> &
  Pick<Message, "type">;

export class BaseMessenger {
  public readonly sender: MessageSender;
  public readonly adapter: Adapter;
  public readonly options: Required<MessengerOptions>;

  constructor(
    sender: MessageSender,
    adapter: Adapter,
    options: Required<MessengerOptions>
  ) {
    this.sender = sender;
    this.adapter = adapter;
    this.options = options;
  }

  protected timestamp() {
    return Date.now();
  }

  private createCallback(cb: (...args: any) => any) {
    const callbackId = nanoid();

    this.onMessage((message) => {
      if (message.type !== "callback") return;
      if (message.id !== callbackId) return;

      if (message.error) {
        throw message.error;
      } else {
        cb(...message.data);
      }
    });

    return callbackId;
  }

  private encodeArgs(args: any[]) {
    const callbackIds: string[] = [];

    const encodedArgs = args.map((arg) => {
      if (typeof arg !== "function") {
        return arg;
      }
      const callbackId = this.createCallback(arg);
      callbackIds.push(callbackId);
      return callbackId;
    });

    return {
      encodedArgs,
      callbackIds,
    } as const;
  }

  private decodeArgs(message: Message) {
    if (!message.args) return [];

    return message.args.map((arg) => {
      if (message.callbackIds?.includes(arg)) {
        return (...args: any[]) => {
          const message = this.createMessage({
            id: arg,
            type: "callback",
            args,
          });
          this.sendMessage(message);
        };
      }
      return arg;
    });
  }

  public createMessage({
    id,
    type,
    args,
    data,
    error,
    path,
  }: CreateMessageOptions) {
    const { encodedArgs, callbackIds } = this.encodeArgs(args ?? []);

    return {
      type,
      args: encodedArgs,
      callbackIds,
      path: path ?? [],
      data,
      error,
      id: id ?? nanoid(),
      sender: this.sender,
      timeStamp: this.timestamp(),
      namespace: this.options.namespace,
    } satisfies Message;
  }

  public onMessage(cb: (message: Message) => any) {
    return this.adapter.onMessage((message) => {
      if (!isValidMessage(message)) return;
      if (message.namespace !== this.options.namespace) return;
      if (message.sender === this.sender) return;

      const args = this.decodeArgs(message);

      cb({ ...message, args });
    });
  }

  public async sendMessage(message: Message) {
    await this.adapter.sendMessage(message);
  }

  public async createResponseHandler(
    messageId: string,
    type: MessageType,
    handler: <T extends any>(data?: T, error?: any) => void
  ) {
    const offMessage = await this.onMessage((message) => {
      if (message.type !== type) return;
      if (message.id !== messageId) return;

      offMessage?.();
      handler(message.data, message.error);
    });

    return offMessage;
  }
}
