import { Adapter } from "../core/adapter";
import { setupTwoWayBridge } from "../core/bridge";

import NoopAdapter from "../core/adapters/noop";
import WindowAdapter from "./window";
import PortAdapter from "./port";

import type { OnMessageCallback } from "../core/adapter";

export default class ContentScriptAdapter extends Adapter {
  private readonly portAdapter;
  private readonly windowAdapter;

  public constructor() {
    super();

    this.portAdapter = new PortAdapter();

    if ("window" in globalThis) {
      this.windowAdapter = new WindowAdapter();

      setupTwoWayBridge("content-script", this.windowAdapter, this.portAdapter);
    } else {
      this.windowAdapter = new NoopAdapter();
    }
  }

  public onMessage(cb: OnMessageCallback) {
    this.portAdapter.onMessage(cb);
  }

  public sendMessage(message: any) {
    this.portAdapter.sendMessage(message);
  }

  public disconnect() {
    this.portAdapter.disconnect();
    this.windowAdapter.disconnect();
  }
}
