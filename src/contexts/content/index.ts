import "@/common/messaging/contexts/contentScript";

import { getPageType } from "@/common/mapgenie";

import extensionService from "@/services/extension.service";
import { contentLoggerService } from "@/services/logger.service";

import { mountLoadingOverlay } from "./ui/LoadingOverlay";

export default defineContentScript({
  matches: ["<mapgenie_domains>"],
  allFrames: true,
  runAt: "document_start",
  async main() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("fmgBackend")) return;

    const page = await getPageType();
    if (page === "unknown") return;

    const unmountLoadingOverlay = await mountLoadingOverlay();

    extensionService.provide({ unmountLoadingOverlay });
    contentLoggerService.provide();

    await injectScript("/page.js");
  },
});
