import "@/common/messaging/contexts/port";

import storageService from "@/services/storage.service";

/**
 * This script provides the storage service.
 * To access localstorage for a given domain.
 */

export default defineContentScript({
  matches: ["*://*/?fmgStorage"],
  runAt: "document_start",
  allFrames: true,
  main() {
    storageService.provide(window.location.host);

    // Stop further loading of this frame
    // This frame is only used to provide storage access
    window.stop();
  },
});
