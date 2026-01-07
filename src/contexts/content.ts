import "@/common/messaging/contexts/contentScript";

import testService from "@/services/test.service";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    console.log("author:", import.meta.env.PKG_AUTHOR);
    console.log("version:", import.meta.env.PKG_VERSION);
    console.log("homepage:", import.meta.env.PKG_HOMEPAGE);

    console.log("mapgenie api url:", import.meta.env.MAPGENIE_API_URL);

    const test = testService.use();

    console.log("counter:", await test.counter());
    console.log("counter:", await test.counter());

    console.log("memoizedCounter:", await test.memoizedCounter());
    console.log("memoizedCounter:", await test.memoizedCounter());

    console.log("Hello content.");
  },
});
