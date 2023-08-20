/// #if DEBUG
logger.enableHistory();
/// #endif

/// #if FIREFOX
import { initFirefoxScriptBlocker } from "./firefox-script-blocker";
initFirefoxScriptBlocker();
/// #endif

logger.log("background script loaded");

logger.save();
