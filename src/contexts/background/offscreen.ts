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

let backendTabId: number | undefined;
let creatingBackendTab: Promise<void> | undefined;

const ensureBackendTab = (windowId?: number): Promise<void> => {
  if (creatingBackendTab) return creatingBackendTab;
  creatingBackendTab = (async () => {
    const url = browser.runtime.getURL("/offscreen.html");
    const existing = await browser.tabs.query({ url });
    const tab = existing[0] ?? await browser.tabs.create({ url, active: false, pinned: true, ...(windowId !== undefined ? { windowId } : {}) });
    backendTabId = tab.id;
    if (tab.id !== undefined) {
      await browser.tabs.update(tab.id, { autoDiscardable: false });
      if (tab.discarded) await browser.tabs.reload(tab.id);
    }
  })().finally(() => { creatingBackendTab = undefined; });
  return creatingBackendTab;
};

export const createOffscreenDocument = async () => {
  if (import.meta.env.VIVALDI_COMPAT) {
    // Vivaldi does not inject all_frames scripts into offscreen documents.
    // A real extension tab preserves the existing sandbox and storage origins.
    browser.tabs.onRemoved.addListener((tabId, info) => {
      if (tabId !== backendTabId) return;
      void (async () => {
        if (info.isWindowClosing) {
          const windows = await browser.windows.getAll({ windowTypes: ["normal"] });
          const remaining = windows.find((window) => window.id !== info.windowId);
          // Do not resurrect a window when the user exits the browser.
          if (remaining?.id === undefined) return;
          await ensureBackendTab(remaining.id);
        } else {
          await ensureBackendTab();
        }
      })().catch((error) => logger.error("Backend tab recreation failed", error));
    });
    await ensureBackendTab();
  } else if (import.meta.env.FIREFOX) {
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
