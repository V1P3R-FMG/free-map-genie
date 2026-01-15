import "@/common/messaging/contexts/contentScript";

import testService from "@/services/test.service";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main() {
    const test = testService.use();

    await injectScript("/page.js");
  },
});
