import { getPageType } from "@shared/page";
import { FMG_Map } from "./map";
import { FMG_MapSelector } from "./map-selector";
import { FMG_Data } from "./data";
import { FMG_Games, FMG_MapData, FMG_MapInfo } from "@fmg/info";

/**
 * Itialize the content script
 */
async function init() {
    if (__DEBUG__) {
        window.fmgInfo = {
            games: await FMG_Games.get(),
            mapData: FMG_MapData.prototype,
            mapInfo: FMG_MapInfo.get(window)
        };

        if (window.store) {
            // If window.store is defined, the page has allready been loaded.
            // This can happen if the extension is reloaded.
            location.reload();
            throw new Error("Store allready defined, reloading page");
        }
    }

    // TODO: fix script blocking
    if (!FMG_Data.settings.extension_enabled) {
        return; // Extension is disabled
    }

    // Check if the page is a map or guide
    const type = getPageType(window);
    switch (type) {
        case "map":
            return FMG_Map.setup(window);
        case "map-selector":
            return FMG_MapSelector.setup(window);
        default:
            logger.warn(`Page type ${type}, not installing map/guide!`);
            return;
    }
}

init()
    .then(() => logger.log("content script init done"))
    .catch((err) => logger.error(err));
