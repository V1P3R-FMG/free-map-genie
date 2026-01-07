import type { PublicPath, Browser } from "wxt/browser";

export type PublicPathLike = PublicPath | (string & {});

export class OffscreenUtils {
  public static async exists(url: PublicPathLike) {
    const existingContexts = await browser.runtime.getContexts({
      contextTypes: ["OFFSCREEN_DOCUMENT"],
      documentUrls: [browser.runtime.getURL(url)],
    });
    return Boolean(existingContexts.length);
  }

  public static async create(
    url: PublicPathLike,
    reasons: Browser.offscreen.CreateParameters["reasons"],
    justification: string
  ) {
    if (await this.exists(url)) return;

    await browser.offscreen.createDocument({
      url,
      reasons,
      justification,
    });
  }
}
