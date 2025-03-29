import channel from "@shared/channel/content";

import { getPageType } from "@fmg/page";
import { FMG_Map } from "./map";
import { FMG_Guide } from "./guide";
import { FMG_MapSelector } from "./map-selector";
import debounce from "@shared/debounce";

function listenForRefocus(callback: () => void) {
    document.addEventListener("visibilitychange", debounce(() => {
        switch (document.visibilityState) {
            case "visible":
                callback();
                logger.debug("refocused");
                break;
        }
    }, 250));
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
    channel.connect();

    // Check if the page is a map or guide
    const type = await getPageType(window);
    if (type === "map") {
        const map = new FMG_Map(window);
        await map.setup();
        listenForRefocus(() => map.reload());
        return true;
    } else if (type === "guide") {
        const guide = new FMG_Guide(window);
        await guide.setup();
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
