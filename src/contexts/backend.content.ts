import "@/common/messaging/contexts/port";

import backendService from "@/services/backend.service";
import { backgroundLoggerService } from "@/services/logger.service";

/**
 * This script provides the backend and storage manager services.
 * For the mapgenie.io domain.
 */

export default defineContentScript({
  matches: ["https://mapgenie.io/*?fmgBackend"],
  runAt: "document_start",
  allFrames: true,
  async main() {
    backendService.provide();

    const loggerService = backgroundLoggerService.use();
    logger.setRemoteService(loggerService);

    logger.log("Backend content script started.");

    window.onunhandledrejection = (event) => {
      logger.error("Unhandled promise rejection:", event.reason);
    };

    window.onerror = (message, source, lineno, colno, error) => {
      logger.error("Uncaught error:", {
        message,
        source,
        lineno,
        colno,
        error,
      });
    };

    // Stop further loading of this frame
    // This frame is only used to provide backend and storage manager access
    window.stop();
  },
});
