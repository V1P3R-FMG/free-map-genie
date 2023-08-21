import { getPageType } from "@fmg/page";
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
            maps: window.game?.id ? FMG_Maps.get(window.game.id) : undefined,
            mapData: {
                get: FMG_MapData.get
            }
        };
    }

    // Check if the page is a map or guide
    const type = getPageType(window);

    if (type !== "unknown") {
        let doReload = false;
        if (window.store) {
            // If window.store is defined, the page has allready been loaded.
            // This can happen if the extension is reloaded.
            let i = JSON.parse(
                window.sessionStorage.getItem("fmg:reload:count") ?? "0"
            );
            if (i > 3) {
                logger.error(
                    "reloaded 3 times, not reloading again to prevent reload loop!"
                );
                doReload = false;
            } else {
                window.sessionStorage.setItem(
                    "fmg:reload:count",
                    (++i).toString()
                );
                logger.error(
                    "reloaded 3 times, not reloading again to prevent reload loop!"
                );
                doReload = true;
            }
        }

        if (!doReload) {
            window.sessionStorage.removeItem("fmg:reload:count");
        } else {
            window.location.reload();
        }
    }

    switch (type) {
        case "map":
            await FMG_Map.setup(window).catch((err) => {
                logger.error("[MAP]", err);
            });
            return true;
        case "map-selector":
            await FMG_MapSelector.setup(window).catch((err) => {
                logger.error("[MAP-SELECTOR]", err);
            });
            return true;
        case "guide":
        case "login":
        case "upgrade":
        case "home":
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
        logger.error("[CONTENT]", err);
    });
