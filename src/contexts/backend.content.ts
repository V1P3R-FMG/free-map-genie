import "@/common/messaging/contexts/port";

import backendService from "@/services/backend.service";

/**
 * This script provides the backend and storage manager services.
 * For the mapgenie.io domain.
 */

export default defineContentScript({
  matches: ["*://mapgenie.io/?fmgBackend"],
  runAt: "document_start",
  allFrames: true,
  main() {
    backendService.provide();

    // Stop further loading of this frame
    // This frame is only used to provide backend and storage manager access
    window.stop();
  },
});
