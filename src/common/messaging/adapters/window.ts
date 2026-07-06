import { Adapter } from "../core/adapter";

import type { OnMessageCallback } from "../core/adapter";

export interface WindowMessage {
  source: string[];
  message: any;
}

export default class WindowAdapter extends Adapter {
  private readonly win: Window;
  private readonly callbacks: Set<OnMessageCallback> = new Set();

  private readonly messageHandler = (e: MessageEvent) => this.handleMessage(e);

  public constructor(window?: Window) {
    super();

    this.win = window ?? globalThis.window;

    this.win.addEventListener("message", this.messageHandler);
  }

  private handleMessage(e: MessageEvent) {
    if (!this.isWindowMessage(e.data)) return;

    const { message } = e.data;

    this.callbacks.forEach((cb) => cb(message));
  }

  private isWindowMessage(data: any): data is WindowMessage {
    return typeof data === "object" && data.source && data.message;
  }

  public onMessage(cb: OnMessageCallback) {
    this.callbacks.add(cb);

    return () => {
      this.callbacks.delete(cb);
    };
  }

  public sendMessage(message: any) {
    this.win.postMessage({
      source: ["react"], // silence map.js 'Unknown message type:' warning.
      message,
    });
  }

  public disconnect() {
    this.callbacks.clear();
    this.win.removeEventListener("message", this.messageHandler);
  }
}
