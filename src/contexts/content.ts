import "@/common/messaging/contexts/contentScript";

export default defineContentScript({
  matches: ["<all_urls>"],
  allFrames: true,
  async main() {
    await injectScript("/page.js");
  },
});
