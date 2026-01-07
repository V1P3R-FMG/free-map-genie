import { isValidMessage } from "../message";
import { Adapter } from "../adapter";

import type { Message } from "../message";
import type { OnMessageCallback } from "../adapter";

export default class DedupeAdapter extends Adapter {
  private adapter: Adapter;

  private readonly recentMessageIds: Set<string> = new Set();
  private readonly callbacks: Set<OnMessageCallback> = new Set();

  private readonly ttl: number;

  public constructor(adapter: Adapter, ttl = 1000) {
    super();

    this.adapter = adapter;
    this.ttl = ttl;

    this.adapter.onMessage((message) => this.handleMessage(message));
  }

  private messageHash(message: Message) {
    return [message.id, message.sender].join("::");
  }

  private forwardMessage(message: Message) {
    this.callbacks.forEach((cb) => cb(message));
  }

  private handleMessage(message: any) {
    if (!isValidMessage(message)) return;

    if (message.type === "ping") {
      this.forwardMessage(message);
      return;
    }

    const hash = this.messageHash(message);
    if (this.recentMessageIds.has(hash)) {
      return;
    }

    this.recentMessageIds.add(hash);

    setTimeout(() => {
      this.recentMessageIds.delete(hash);
    }, this.ttl);

    this.forwardMessage(message);
  }

  public sendMessage(message: any) {
    this.adapter.sendMessage(message);
  }

  public onMessage(cb: OnMessageCallback) {
    this.callbacks.add(cb);

    return () => {
      this.callbacks.delete(cb);
    };
  }

  public disconnect() {
    this.adapter.disconnect();
    this.callbacks.clear();
    this.recentMessageIds.clear();
  }
}
