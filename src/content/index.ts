import { timeout, waitForGlobals } from "@/shared/async";
import { createScript, getElement } from "@shared/dom";
import { getPageType } from "@shared/page";
import { FMG_Map } from "./map";

/*
 * Because we delayed the map script, we need to manually create the google maps object.
 * If altMapSdk is enabled.
 * Because google.maps will allready be defined by another script,
 * and there for the map script will never define a maps mock object.
 **/
function fixGoogleMaps(): void {
    if (window.config?.altMapSdk) {
        window.google = window.google || {};
        window.google.maps = {
            Size() {}
        };
    }
}

/*
 * Load the map script, and wait for the globals to be defined.
 **/
async function loadMapScript(): Promise<void> {
    const script = await getElement<HTMLScriptElement>(
        "script[src^='https://cdn.mapgenie.io/js/map.js?id=']"
    );

    if (!script) throw new Error("Map script not found");

    createScript({
        src: script.src.replace("id=", "ready&id="),
        appendTo: document.body
    });

    return timeout(waitForGlobals(["axios", "store"], window), 10 * 1000);
}

async function init() {
    // If window.store is defined, the page has allready been loaded.
    // This can happen if the extension is reloaded.
    if (window.store) {
        location.reload();
        throw new Error("Store allready defined, reloading page");
    }

    // Fix google maps
    fixGoogleMaps();

    // Load the mapgenie map script, that was previously blocked by the background script.
    await loadMapScript();

    const type = getPageType(window);
    switch (type) {
        case "map":
            // Install the map
            FMG_Map.install(window);
            return;
        default:
            logger.warn(`Page type ${type}, not installing map/guide!`);
            return;
    }
}

init()
    .then(() => {
        logger.log("content script init done");
    })
    .catch((err) => {
        logger.error("Failed to get script", err);
    });
