import "@/common/messaging/contexts/contentScript";

import extensionService from "@/services/extension.service";
import { contentLoggerService } from "@/services/logger.service";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main() {
    extensionService.provide();
    contentLoggerService.provide();

    await injectScript("/page.js");
  },
});
