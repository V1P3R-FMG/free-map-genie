import { ExtensionSettings } from "@/common/extension/settings";
import { createService, type ProxiedObject } from "@/common/messaging";

import { WindowManager } from "@/common/windowManager";

class BackgroundService {
  private readonly windowManager = new WindowManager();

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

  public async setExtensionEnabled(enabled: boolean) {
    await ExtensionSettings.enabled.setValue(enabled);
  }

  public async getExtensionEnabled() {
    return ExtensionSettings.enabled.getValue();
  }

  public async openDataManager() {
    await this.windowManager.open(browser.runtime.getURL("dataManager.html"), {
      focused: true,
      width: 1000,
      height: 800,
    });
  }

  public async closeDataManager() {
    await this.windowManager.close(browser.runtime.getURL("dataManager.html"));
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
