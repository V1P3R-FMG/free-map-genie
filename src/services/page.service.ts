import { createService, type ProxyInstance } from "@/common/messaging";
import { getPageType } from "@/common/mapgenie";

import type { Bookmark, ImageUrl } from "@/common/bookmark";

type PartialBookmark = {
  title: string | null;
  url: string | null;
  preview: ImageUrl | null;
  icon?: ImageUrl | null;
};

const validateBookmark: (
  bookmark: PartialBookmark
) => asserts bookmark is Omit<Bookmark, "pageType" | "createdAt"> = (
  bookmark
) => {
  const missing = Object.entries(bookmark)
    .map(([name, element]) => (element ? name : null))
    .filter((name) => name === null)
    .join(", ");

  if (missing) {
    logger.error(
      "Missing required meta tags for bookmark creation, missing: " + missing,
      window.location.href
    );

    throw new Error(
      "Missing required meta tags for bookmark creation, missing: " + missing
    );
  }
};

const getPageInfoFromHead = (): PartialBookmark => {
  const urlMeta = document.head.querySelector<HTMLMetaElement>(
    "meta[property='og:url']"
  );

  const iconLink = document.head.querySelector<HTMLLinkElement>(
    "link[rel='apple-touch-icon']"
  );

  const titleMeta = document.head.querySelector<HTMLMetaElement>(
    "meta[property='og:title']"
  );

  const imageMeta = document.head.querySelector<HTMLMetaElement>(
    "meta[property='og:image']"
  );

  return {
    url: urlMeta?.content || null,
    title: titleMeta?.content || null,
    preview: imageMeta?.content || null,
    icon: iconLink?.href || null,
  };
};

const getPreviewForMap = (preview: ImageUrl | null): ImageUrl | null => {
  const map = window.mapData!.map;
  const game = window.game!;
  const url = `https://cdn.mapgenie.io/images/games/${game.slug}/maps/${map.slug}.jpg`;

  const fallback = typeof preview === "string" ? preview : preview?.fallback;

  return fallback ? { url, fallback } : null;
};

export class PageService {
  public async createBookmark(): Promise<Bookmark> {
    let { url, title, preview, icon } = getPageInfoFromHead();

    const params = new URLSearchParams(window.location.search);
    const fmgMapId = params.get("fmgMapId");

    const mapId = fmgMapId ?? window.mapData?.map.id;

    // Fetch map data if mapId is available
    if (mapId) {
      // Validate map ID matches
      const map = window.mapData!.map;
      if (mapId != map.id) {
        throw new Error("Map ID mismatch");
      }

      const game = window.game!;

      preview = getPreviewForMap(preview);
      title = game.title + " | " + map.title;
    }

    // Append fmgMapId to URL if present
    if (fmgMapId) {
      url = `${url}?fmgMapId=${fmgMapId}`;
    }

    const bookmark = { url, preview, title, icon };
    validateBookmark(bookmark);

    const pageType = await getPageType();

    return {
      ...bookmark,
      pageType: pageType,
      createdAt: Date.now(),
    };
  }

  public async ping() {
    return "pong";
  }
}

const pageService = createService({
  context: PageService,
  namespace: "PageService",
  heartbeatTimeout: 60000,
});

namespace pageService {
  export type Instance = ProxyInstance<typeof PageService>;
}

export default pageService;
