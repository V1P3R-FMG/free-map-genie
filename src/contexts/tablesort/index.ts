import { GlobalBlock } from "@/common/globalBlock.js";

// Import original tablesort
import "./tablesort@5.6.0.min.js";

declare global {
  interface Window {
    __fmgActivateGuideScript?: () => void;
  }
}

/**
 * This script is injected via redirecting the original tablesort script using webRequest/declarativeNetRequest in the background.
 * It blocks the inline guide script from running initially by crashing it, then sets up a hook to activate it later when needed.
 * The guide page script will call window.__fmgActivateGuideScript after its done with loading and setup.
 */
export default defineUnlistedScript(() => {
  logger.debug("Running guide page tablesort blocker script");

  // Only run on guide pages.
  const $body = $(document.body);
  if (!$body.hasClass("guide")) {
    return;
  }

  // We block tablesort so the inital guide script will crash.
  const tablesortBlock = new GlobalBlock("Tablesort");

  tablesortBlock.onBlocked(() => {
    logger.debug(
      "Tablesort script blocked, setting up activation hook",
      document.currentScript
    );

    const script = document.currentScript!;

    if (!script.innerHTML.trim().startsWith("let baseUrl")) {
      logger.warn(
        "Unexpected script blocked notify fmg authors, this is likely a bug."
      );
      return;
    }

    window.__fmgActivateGuideScript = () => {
      // We can now unblock tablesort and run the original script
      if (!tablesortBlock.isBlocked) return;
      tablesortBlock.unblock();
      eval(script.innerHTML);
    };
  });
});
