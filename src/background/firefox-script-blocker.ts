/**
 * For Firefox only.
 *
 * We block the initial request to the map script, so the extension has time to load.
 * After its ready, it will request the map script again with the "ready" parameter.
 * We redirect it without the ready parameter.
 */

const allowRequests: Record<string, boolean> = {};

export function initFirefoxScriptBlocker() {
    if (__BROWSER__ !== "firefox") return;
    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            if (allowRequests[details.requestId]) {
                // #if DEBUG
                logger.debug("allow request", {
                    requestId: details.requestId,
                    url: details.url
                });
                // #endif
                delete allowRequests[details.requestId];
                return;
            }
            // #if DEBUG
            logger.debug("block request", {
                requestId: details.requestId,
                url: details.url
            });
            // #endif
            return { cancel: true };
        },
        { urls: ["https://cdn.mapgenie.io/js/map.js?id=*"] },
        ["blocking"]
    );

    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            // #if DEBUG
            logger.debug("redirect request", {
                requestId: details.requestId,
                url: details.url
            });
            // #endif
            allowRequests[details.requestId] = true;
            return {
                redirectUrl: details.url.replace("ready&id=", "id=")
            };
        },
        { urls: ["https://cdn.mapgenie.io/js/map.js?ready&id=*"] },
        ["blocking"]
    );
}
