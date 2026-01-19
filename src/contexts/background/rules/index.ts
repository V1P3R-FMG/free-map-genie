import { ExtensionSettings } from "@/common/extension/settings";

import { RulesManager } from "./manager";
import { DeclarativeNetRequestManager } from "./declarativeNetRequest";
import { WebRequestManager } from "./webRequest";

export class Rules {
  private readonly manager: RulesManager = this.createManager();

  constructor() {
    this.setupRules();

    ExtensionSettings.enabled.watch(async (enabled) => {
      logger.debug("Extension enabled state changed updating rules.", {
        enabled,
      });

      if (enabled) {
        await this.enable();
      } else {
        await this.disable();
      }
    });
  }

  private createManager() {
    if (browser.declarativeNetRequest !== undefined) {
      return new DeclarativeNetRequestManager();
    }
    return new WebRequestManager();
  }

  public setupRules() {
    // Remove X-Frame-Options headers to allow embedding in iframe
    // So we can use it in our offscreen/background document to host our backend
    this.manager.addRule({
      id: 1,
      action: {
        type: "modifyHeaders",
        responseHeaders: [
          {
            header: "X-Frame-Options",
            operation: "remove",
          },
          {
            header: "Frame-Options",
            operation: "remove",
          },
        ],
      },
      condition: {
        requestDomains: ["mapgenie.io"],
        resourceTypes: ["sub_frame"],
      },
    });

    // Block mapgenie.io map script
    // We'll manually load it later after were done with the setup
    this.manager.addRule({
      id: 2,
      action: { type: "block" },
      condition: {
        requestDomains: ["cdn.mapgenie.io"],
        urlFilter: "/js/map.js?id=*",
        resourceTypes: ["script"],
      },
    });

    // Block mapgenie.io tarkov 17 quest script
    // We'll manually load it later after were done with the setup
    this.manager.addRule({
      id: 3,
      action: { type: "block" },
      condition: {
        requestDomains: ["cdn.mapgenie.io"],
        urlFilter: "/js/TarkovQuestToolWidget.js?id=*",
        resourceTypes: ["script"],
      },
    });
  }

  public async enable() {
    await this.manager.enable([1, 2, 3]);
  }

  public disable() {
    return this.manager.disable([2, 3]);
  }
}
