import "@/common/messaging/contexts/contentScript";

import { contentLoggerService } from "@/services/logger.service";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main() {
    contentLoggerService.provide();

    await injectScript("/page.js");
  },
});
