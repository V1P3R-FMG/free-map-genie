import { createService, type ProxiedObject } from "@/common/messaging";
import { getPageType } from "@/common/mapgenie";

import type { Bookmark } from "@/common/bookmark";

export class PageService {
  public async createBookmark(): Promise<Bookmark> {
    const ogUrl = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:url']"
    );

    const icon = document.head.querySelector<HTMLLinkElement>(
      "link[rel='apple-touch-icon']"
    );

    const ogTitle = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:title']"
    );

    const ogImage = document.head.querySelector<HTMLMetaElement>(
      "meta[property='og:image']"
    );

    const missing = Object.entries({
      url: ogUrl,
      image: ogImage,
      title: ogTitle,
      icon: icon,
    })
      .map(([name, element]) => (element ? name : null))
      .filter((name) => name !== null)
      .join(", ");

    if (missing.length > 0) {
      logger.error(
        "Missing required meta tags for bookmark creation, missing: " + missing,
        window.location.href
      );

      throw new Error(
        "Missing required meta tags for bookmark creation, missing: " + missing
      );
    }

    const pageType = await getPageType();

    return {
      url: ogUrl!.content,
      title: ogTitle!.content,
      preview: ogImage!.content,
      icon: icon!.href,
      pageType: pageType,
    };
  }

  public async ping() {
    return "pong";
  }
}

const pageService = createService({
  context() {
    return new PageService();
  },
  namespace: "PageService",
  heartbeatTimeout: 60000,
});

namespace pageService {
  export type Instance = ProxiedObject<PageService>;
}

export default pageService;
