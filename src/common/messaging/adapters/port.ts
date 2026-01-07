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

    this.port = browser.runtime.connect({ name: this.id });

    this.port.onMessage.addListener((message: any) =>
      this.handleMessage(message)
    );

    // Reconnect on disconnect
    this.port.onDisconnect.addListener(() => this.connect());
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
    this.port?.postMessage(message);
  }

  public disconnect() {
    this.callbacks.clear();
    this.port?.disconnect();
  }
}
