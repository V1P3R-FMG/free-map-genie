import type { Browser } from "wxt/browser";

export class BrowserUtils {
  public static async getActiveTab(): Promise<Browser.tabs.Tab | undefined> {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    return tab;
  }

  public static async getActiveTabId() {
    const tab = await this.getActiveTab();
    return tab?.id;
  }
}
