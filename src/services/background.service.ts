import { ExtensionSettings } from "@/common/extension/settings";
import { createService, type ProxiedObject } from "@/common/messaging";

import offscreenService from "./offscreen.service";

class BackgroundService {
  private readonly offscreen = offscreenService.use();

  public async getActiveTab(): Promise<Browser.tabs.Tab | undefined> {
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tabs[0] ?? undefined;
  }

  public async reloadActiveTab(): Promise<void> {
    const tab = await this.getActiveTab();
    if (tab?.id !== undefined) {
      await browser.tabs.reload(tab.id);
    }
  }

  public async reloadBackend(): Promise<void> {
    await this.offscreen.reloadIframe("https://mapgenie.io/?fmgBackend");
  }

  public async setExtensionEnabled(enabled: boolean) {
    await ExtensionSettings.enabled.setValue(enabled);
  }

  public async getExtensionEnabled() {
    return ExtensionSettings.enabled.getValue();
  }
}

const backgroundService = createService({
  context: BackgroundService,
  namespace: "BackgroundService",
  heartbeatTimeout: import.meta.env.SERVICE_TIMEOUT,
});

namespace backgroundService {
  export type Instance = ProxiedObject<BackgroundService>;
}

export default backgroundService;
