import { BaseMessenger } from "./base";

import type { Adapter } from "../adapter";
import type { Message } from "../message";
import type { MessengerOptions } from "./base";

export class ProviderMessenger<
  M extends Message = Message
> extends BaseMessenger {
  public constructor(adapter: Adapter, options: Required<MessengerOptions>) {
    super("provider", adapter, options);
  }

  private encodeError(error?: any) {
    if (error === undefined) {
      return;
    }
    return String(error);
  }

  public pong(message: M) {
    const response = this.createMessage({
      id: message.id,
      type: "pong",
    });

    this.sendMessage({
      ...message,
      ...response,
    });
  }

  public respondInvokeSuccess(message: Message, data: any) {
    const { path } = message;

    const response = this.createMessage({
      id: message.id,
      type: "invoke",
      path,
      data,
    });

    this.sendMessage({
      ...message,
      ...response,
    });
  }

  public respondInvokeFail(message: Message, error: any) {
    const { path } = message;

    const encodedError = this.encodeError(error);

    const response = this.createMessage({
      id: message.id,
      type: "invoke",
      path,
      error: encodedError,
    });

    this.sendMessage({
      ...message,
      ...response,
    });
  }
}
