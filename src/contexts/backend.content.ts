import "@/common/messaging/contexts/port";

import backendService from "@/services/backend.service";
import { backgroundLoggerService } from "@/services/logger.service";
import { waitForBody } from "@/common/dom";

const setupLogger = () => {
  const loggerService = backgroundLoggerService.use();
  logger.setRemoteService(loggerService);

  window.onunhandledrejection = (event) => {
    logger.error("Unhandled promise rejection:", String(event.reason));
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
};

/**
 * This script provides the backend and storage manager services.
 * For the mapgenie.io domain.
 */

export default defineContentScript({
  matches: ["https://mapgenie.io/*?fmgBackend"],
  runAt: "document_start",
  allFrames: true,
  async main() {
    setupLogger();

    // Ensure the body is loaded before providing services
    await waitForBody();

    backendService.provide();

    logger.log("Backend content script started.");

    // Stop further loading of this frame
    // This frame is only used to provide backend and storage manager access
    window.stop();
  },
});
