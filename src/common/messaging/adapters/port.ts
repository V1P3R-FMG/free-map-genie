import { nanoid } from "nanoid";

import { Adapter } from "../core/adapter";

import type { OnMessageCallback } from "../core/adapter";

export default class PortAdapter extends Adapter {
  private readonly id: string;

  private port?: Browser.runtime.Port;

  private readonly callbacks: Set<(message: any) => any> = new Set();

  public constructor() {
    super();

    this.id = nanoid();

    this.connect();
  }

  private connect() {
    this.port?.disconnect();

    // Supress possible errors from lastError
    const _ = browser.runtime.lastError;

    this.port = browser.runtime.connect({ name: this.id });

    this.port.onMessage.addListener((message: any) =>
      this.handleMessage(message)
    );

    // Reconnect on disconnect
    this.port.onDisconnect.addListener(() => {
      // Supress possible errors from lastError
      const _ = browser.runtime.lastError;

      this.connect();
    });
  }

  private handleMessage(message: any) {
    this.callbacks.forEach((cb) => cb(message));
  }

  public onMessage(cb: OnMessageCallback) {
    this.callbacks.add(cb);

    return () => {
      this.callbacks.delete(cb);
    };
  }

  public sendMessage(message: any) {
    try {
      this.port?.postMessage(message);

      // Supress possible errors from lastError
      const _ = browser.runtime.lastError;
    } catch (e) {
      if (e instanceof Error) {
        if (
          e.message.includes("Attempting to use a disconnected port object")
        ) {
          logger.warn(
            "Port was disconnected, reconnecting and retrying message"
          );

          // Reconnect and retry
          this.connect();
          this.port?.postMessage(message);
          return;
        }
      }

      // rethrow if it's a different error
      throw e;
    }
  }

  public disconnect() {
    this.callbacks.clear();
    this.port?.disconnect();
  }
}
