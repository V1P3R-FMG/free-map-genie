import "@/common/messaging/contexts/contentScript";

export default defineContentScript({
  matches: ["<all_urls>"],
  async main() {
    await injectScript("/page.js");
    await injectStyle("/css/fmg-icons.css");

    logger.log("Content script initialized.");
  },
});
