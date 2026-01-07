import "@/common/messaging/contexts/contentScript";

import testService from "@/services/test.service";
import storageService from "@/services/storage.service";

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

    const mapgenieStorage = await storageService.use("https://mapgenie.io");
    const rdr2Storage = await storageService.use("https://rdr2map.com");

    logger.log("mapgenie.io | get foo:", await mapgenieStorage.get("foo"));
    logger.log("mapgenie.io | set foo = baz");
    await mapgenieStorage.set("foo", "baz");
    logger.log("mapgenie.io | get foo:", await mapgenieStorage.get("foo"));
    logger.log("mapgenie.io | delete foo");
    await mapgenieStorage.remove("foo");
    logger.log("mapgenie.io | get foo:", await mapgenieStorage.get("foo"));

    logger.log("rdr2map.com | get bar:", await rdr2Storage.get("bar"));
    await rdr2Storage.set("bar", "qux");
    logger.log("rdr2map.com | get bar:", await rdr2Storage.get("bar"));
    logger.log("rdr2map.com | delete bar");
    await rdr2Storage.remove("bar");
    logger.log("rdr2map.com | get bar:", await rdr2Storage.get("bar"));

    logger.log("Hello content.");
  },
});
