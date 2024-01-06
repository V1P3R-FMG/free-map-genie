import { getPageType } from "@fmg/page";
import { FMG_Map } from "./map";
import { FMG_Guide } from "./guide";
import { FMG_MapSelector } from "./map-selector";

function listenForRefocus(callback: () => void) {
    document.addEventListener("visibilitychange", () => {
        switch (document.visibilityState) {
            case "visible":
                callback();
                logger.debug("refocused");
                break;
        }
    });
}

/**
 * Reload the page, but only if it has not been reloaded consecutively 3 times.
 */
function isReduxStoreDefined(): boolean {
    return !!window.store;
}

/**
 * Itialize the content script
 */
async function init() {
    // Check if the page is a map or guide
    const type = getPageType(window);

    if (type === "map") {
        // Check if the redux store is defined?.
        // And if so tell the user the extension couldn't load probably.
        if (isReduxStoreDefined()) {
            logger.error("window.store is allready defined! The extension may not work probably if this is the case reload the page.");
        }
    }

    if (type === "map") {
        const map = await FMG_Map.setup(window);
        if (map) {
            listenForRefocus(() => map.reload());
        }
        return true;
    } else if (type === "guide") {
        const guide = await FMG_Guide.setup(window);
        listenForRefocus(() => guide.reload());
        return true;
    } else if (type === "map-selector") {
        await FMG_MapSelector.setup(window);
        return true;
    } else if (type === "unknown") {
        logger.warn(`Page type ${type}, not attaching content script`);
        return false;
    }
    return false;
}

init()
    .then((attached) => {
        if (attached) {
            window.postMessage({
                type: "fmg:attached"
            });
            logger.log("content script init done");
        }
    })
    .catch((err) => {
        window.postMessage({
            type: "fmg:error",
            error: err.message
        });
        logger.error("[CONTENT]", err);
    });
