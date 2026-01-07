import offscreenService from "@/services/offscreen.service";

export default async function init() {
  offscreenService.provide();

  logger.log("Offscreen content script initialized.");
}
