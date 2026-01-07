import offscreenService from "@/services/offscreen.service";

export default async function init() {
  offscreenService.provide();

  console.log("Offscreen content script initialized.");
}
