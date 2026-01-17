import "@/common/messaging/contexts/contentScript";

import { getPageType } from "@/common/mapgenie";

import extensionService from "@/services/extension.service";
import { contentLoggerService } from "@/services/logger.service";
import { mountLoadingOverlay } from "../page/ui/LoadingOverlay";

export default defineContentScript({
  matches: ["<mapgenie_domains>"],
  allFrames: true,
  runAt: "document_start",
  async main() {
    extensionService.provide();
    contentLoggerService.provide();

    const page = await getPageType();
    logger.debug("page", page, window.location.href);
    if (page === "unknown") return;

    mountLoadingOverlay();

    await injectScript("/page.js");
  },
});
