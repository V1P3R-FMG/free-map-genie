import initOffscreen from "../offscreen/init";

import type { PublicPath, Browser } from "wxt/browser";

type PublicPathLike = PublicPath | (string & {});

const create = async (
  url: PublicPathLike,
  reasons: Browser.offscreen.CreateParameters["reasons"],
  justification: string
) => {
  const existingContexts = await browser.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [browser.runtime.getURL(url)],
  });

  // If an offscreen document already exists, we don't need to create another one
  const exists = existingContexts.length > 0;
  if (exists) return;

  await browser.offscreen.createDocument({
    url,
    reasons,
    justification,
  });
};

export const createOffscreenDocument = async () => {
  if (import.meta.env.FIREFOX) {
    // Firefox doesn't support offscreen documents, so we use the background page instead
    await initOffscreen();
  } else {
    // For other browsers, we create an offscreen document
    await create(
      "/offscreen.html",
      ["IFRAME_SCRIPTING"],
      "Managing Iframes for Backend, Storage, etc."
    );
  }
};
