import offscreenService from "@/services/offscreen.service";

export default async function init() {
  const offscreen = offscreenService.provide();

  // Load the backend iframe
  await offscreen.addIframe("https://mapgenie.io/?fmgBackend");

  logger.log("Offscreen content script initialized.");
}
