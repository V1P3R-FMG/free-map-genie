import { BaseMessenger } from "./base";

import type { Adapter, OffMessage } from "../adapter";
import type { MessengerOptions } from "./base";

export class ProviderUnavailableError extends Error {
  public constructor(error: string) {
    super(`Provider unavailable: ${error}`);
  }
}

export class UserMessenger extends BaseMessenger {
  public constructor(adapter: Adapter, options: Required<MessengerOptions>) {
    super("user", adapter, options);
  }

  public invoke(path: string[], args: any[]) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = this.createMessage({
          type: "invoke",
          args,
          path,
        });

        await this.createResponseHandler(
          message.id,
          "invoke",
          (data, error) => {
            error
              ? reject(
                  new Error(
                    `Invoke Error for path ${
                      this.options.namespace
                    }.${path.join(".")}: ${error}`
                  )
                )
              : resolve(data);
          }
        );

        this.sendMessage(message);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async ping(
    resolve: () => any,
    reject: (error: any) => any,
    data?: any
  ) {
    try {
      const message = this.createMessage({
        type: "ping",
        data,
      });

      const offMessage = await this.createResponseHandler(
        message.id,
        "pong",
        (_, error) => {
          error ? reject(new Error(error)) : resolve();
        }
      );

      this.sendMessage(message);

      return offMessage;
    } catch (error) {
      reject(error);
    }
  }

  public async heartbeatCheck(data?: any) {
    let intervalCleanup: () => void;
    let timeoutCleanup: () => void;
    const offMessages = new Set<OffMessage>();

    const heartbeatInterval = new Promise<void>((resolve, reject) => {
      const cb = async () => {
        const offMessage = await this.ping(resolve, reject, data);

        if (offMessage) {
          offMessages.add(offMessage);
        }
      };

      let handle = setTimeout(() => {
        cb();
        handle = setInterval(cb, this.options.heartbeatInterval);
      }, 0);

      intervalCleanup = () => clearInterval(handle);
    });

    const heartbeatTimeout = new Promise<void>((_resolve, reject) => {
      const handle = setTimeout(
        reject.bind(
          null,
          new ProviderUnavailableError(
            `heartbeat check timeout ${this.options.heartbeatTimeout}ms.`
          )
        ),
        this.options.heartbeatTimeout
      );

      timeoutCleanup = () => clearTimeout(handle);
    });

    return Promise.race([heartbeatInterval, heartbeatTimeout]).finally(() => {
      intervalCleanup();
      timeoutCleanup();
      offMessages.forEach((cb) => cb());
      offMessages.clear();
    });
  }
}
