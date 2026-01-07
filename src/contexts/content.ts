import "@/common/messaging/contexts/contentScript";

import testService from "@/services/test.service";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    logger.log("author:", import.meta.env.PKG_AUTHOR);
    logger.log("version:", import.meta.env.PKG_VERSION);
    logger.log("homepage:", import.meta.env.PKG_HOMEPAGE);

    logger.log("mapgenie api url:", import.meta.env.MAPGENIE_API_URL);

    const test = testService.use();

    logger.log("counter:", await test.counter());
    logger.log("counter:", await test.counter());

    logger.log("memoizedCounter:", await test.memoizedCounter());
    logger.log("memoizedCounter:", await test.memoizedCounter());

    await injectScript("/page.js");
    await injectStyle("/css/fmg-icons.css");

    logger.log("Hello content.");
  },
});
