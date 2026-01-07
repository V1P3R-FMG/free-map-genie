export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    console.log("author:", import.meta.env.PKG_AUTHOR);
    console.log("version:", import.meta.env.PKG_VERSION);
    console.log("homepage:", import.meta.env.PKG_HOMEPAGE);

    console.log("Hello content.");
  },
});
