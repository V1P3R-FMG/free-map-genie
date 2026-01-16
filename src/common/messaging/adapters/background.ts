import { setupOneWayBridge } from "../core/bridge";
import { Adapter } from "../core/adapter";

import type { Message } from "../core/message";
import type { OnMessageCallback } from "../core/adapter";

import type { Browser } from "wxt/browser";

export interface BackgroundMessage extends Message {
  tab?: Browser.tabs.Tab;
}

export default class BackgroundAdapter extends Adapter {
  private readonly ports: Record<string, Set<Browser.runtime.Port>> = {};
  private readonly callbacks: Set<OnMessageCallback> = new Set();

  private readonly onConnect = (port: Browser.runtime.Port) => {
    this.handlePort(port);
  };

  public constructor() {
    super();

    browser.runtime.onConnect.addListener(this.onConnect);
  }

  private async getActiveTab(): Promise<Browser.tabs.Tab | undefined> {
    return browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => tabs[0]);
  }

  private getKeyForTab(tab?: Browser.tabs.Tab) {
    return tab?.id?.toString() ?? "";
  }

  public isValidMessage(message: any): message is BackgroundMessage {
    return super.isValidMessage(message);
  }

  private handlePort(port: Browser.runtime.Port) {
    const tab = port.sender?.tab;
    const key = this.getKeyForTab(tab);

    port.onMessage.addListener(async (message) => {
      if (!this.isValidMessage(message)) return;

      message.tab ??= tab;

      this.callbacks.forEach((cb) => cb(message));
    });

    setupOneWayBridge({
      name: "background",
      from: this,
      to: this,
    });

    port.onDisconnect.addListener(() => {
      this.ports[key]?.delete(port);
    });

    this.ports[key] ??= new Set();
    this.ports[key].add(port);
  }

  public onMessage(callback: OnMessageCallback) {
    this.callbacks.add(callback);

    return () => {
      this.callbacks.delete(callback);
    };
  }

  public async sendMessage(message: BackgroundMessage) {
    const tab = message.tab ?? (await this.getActiveTab());
    const key = this.getKeyForTab(tab);

    // Send to all global ports
    this.ports[""]?.forEach((port) => {
      port.postMessage(message);

      // Consume runtime.lastError to prevent uncaught exceptions
      const _ = browser.runtime.lastError;
    });

    // Send to specific tab ports
    if (key) {
      this.ports[key]?.forEach((port) => {
        port.postMessage(message);

        // Consume runtime.lastError to prevent uncaught exceptions
        const _ = browser.runtime.lastError;
      });
    }
  }

  public disconnect() {
    browser.runtime.onConnect.removeListener(this.onConnect);
  }
}
