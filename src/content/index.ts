import { getPageType } from "@shared/page";
import { FMG_Map } from "./map";

/**
 * Itialize the content script
 */
async function init() {
    // If window.store is defined, the page has allready been loaded.
    // This can happen if the extension is reloaded.
    if (window.store) {
        location.reload();
        throw new Error("Store allready defined, reloading page");
    }

    // Check if the page is a map or guide
    const type = getPageType(window);
    switch (type) {
        case "map":
            return FMG_Map.setup(window);
        default:
            logger.warn(`Page type ${type}, not installing map/guide!`);
            return;
    }
}

init()
    .then(() => logger.log("content script init done"))
    .catch((err) => logger.error(err));
