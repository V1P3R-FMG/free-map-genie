import { createService, type ProxiedObject } from "@/common/messaging";

class BackgroundService {
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
}

const backgroundService = createService({
  context() {
    return new BackgroundService();
  },
  heartbeatTimeout: 60000,
  namespace: "BackgroundService",
});

namespace backgroundService {
  export type Instance = ProxiedObject<BackgroundService>;
}

export default backgroundService;
