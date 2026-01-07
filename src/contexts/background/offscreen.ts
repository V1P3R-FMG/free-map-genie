import initOffscreen from "../offscreen.content/init";

export const createOffscreenDocument = async () => {
  if (import.meta.env.FIREFOX) {
    // Firefox doesn't support offscreen documents, so we use the background page instead
    await initOffscreen();
  } else {
    // For other browsers, we create an offscreen document
    await OffscreenUtils.create(
      "/offscreen.html",
      ["IFRAME_SCRIPTING"],
      "Managing Iframes for Backend, Storage, etc."
    );
  }
};
