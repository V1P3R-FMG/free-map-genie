import * as async from "@/common/async";

import extensionService from "@/services/extension.service";

import type { Browser, PublicPath } from "wxt/browser";

type PublicPathLike = PublicPath | (string & {});

export class BrowserUtils {
  private static readonly extension = extensionService.use();

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

  public static async getURL(path: string) {
    if (browser && "runtime" in browser) {
      return browser.runtime.getURL(path);
    }
    return this.extension.getURL(path);
  }
}

export const injectStyle = async (path: PublicPathLike) => {
  return new Promise<void>((resolve, reject) => {
    $("<link />", {
      rel: "stylesheet",
      href: browser.runtime.getURL(path),
    })
      .appendTo("head")
      .on("load", () => resolve())
      .on("error", (e: any) => reject(e));
  });
};
