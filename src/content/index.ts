import { getPageType } from "@shared/page";
import { FMG_Map } from "./map";
import { FMG_MapSelector } from "./map-selector";
import { FMG_Maps, FMG_MapData } from "@fmg/info";

/**
 * Itialize the content script
 */
async function init() {
    if (__DEBUG__) {
        window.fmgInfo = {
            //games: await FMG_Games.get(),
            maps: FMG_Maps.get(window),
            mapData: {
                get: FMG_MapData.get
            }
        };
    }

    // Check if the page is a map or guide
    const type = getPageType(window);

    if (type !== "unknown") {
        if (window.store) {
            // If window.store is defined, the page has allready been loaded.
            // This can happen if the extension is reloaded.
            location.reload();
            throw new Error("Store allready defined, reloading page");
        }
    }

    switch (type) {
        case "map":
            await FMG_Map.setup(window);
            return true;
        case "map-selector":
            await FMG_MapSelector.setup(window);
            return true;
        case "login":
        case "upgrade":
            return false;
        default:
            logger.warn(`Page type ${type}, not installing map/guide!`);
            break;
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
        logger.error(err);
    });
