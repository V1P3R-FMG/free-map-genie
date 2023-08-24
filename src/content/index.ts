import { getPageType } from "@fmg/page";
import { FMG_Map } from "./map";
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
function reloadCheck(): boolean {
    if (!window.store) {
        window.sessionStorage.removeItem("fmg:reload:count");
        return false;
    }

    let i = JSON.parse(
        window.sessionStorage.getItem("fmg:reload:count") ?? "0"
    );

    if (i > 3) {
        logger.error(
            "reloaded 3 times, not reloading again to prevent reload loop!"
        );
        window.sessionStorage.removeItem("fmg:reload:count");
        return false;
    }

    window.sessionStorage.setItem("fmg:reload:count", `${++i}`);

    logger.log("reloading page, because the store was allready defined.");

    window.location.reload();

    return true;
}

/**
 * Itialize the content script
 */
async function init() {
    // Check if the page is a map or guide
    const type = getPageType(window);

    if (type === "map") {
        // Check if we need to reload the page, and do so if needed.
        if (reloadCheck()) return;
    }

    if (type === "map") {
        const map = await FMG_Map.setup(window);
        if (map) {
            listenForRefocus(() => map.reload());
        }
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
