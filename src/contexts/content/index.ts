import "@/common/messaging/contexts/contentScript";

import { getPageType } from "@/common/mapgenie";

import extensionService from "@/services/extension.service";
import { contentLoggerService } from "@/services/logger.service";

export default defineContentScript({
  matches: ["<mapgenie_domains>"],
  allFrames: true,
  runAt: "document_start",
  async main() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("fmgBackend")) return;

    const page = await getPageType();
    if (page === "unknown") return;

    const extension = extensionService.provide();
    contentLoggerService.provide();

    await extension.mountLoadingOverlay();

    await injectScript("/page.js");
  },
});
