import type { Browser, PublicPath } from "wxt/browser";

type PublicPathLike = PublicPath | (string & {});

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

  public static getURL(path: string) {
    if ("runtime" in browser) {
      return browser.runtime.getURL(path);
    }

    const script = document.currentScript as HTMLScriptElement;
    const src = script.src;

    const url = new URL(src);
    url.search = "";
    url.pathname = path;

    return url.toString();
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
