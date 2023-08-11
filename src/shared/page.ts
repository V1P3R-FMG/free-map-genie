export type PageType = "map" | "guide" | "home" | "unknown";

/**
 * Checks if the current page is a map page.
 * @returns Returns true if the current page is a map page, false otherwise.
 */
export function isMapPage(window: Window): boolean {
    return !!window.document.body.querySelector(
        "script[src^='https://cdn.mapgenie.io/js/map.js?id=']"
    );
}

/**
 * Checks if the current page is a guide page.
 * @returns Returns true if the current page is a guide page, false otherwise.
 */
export function isGuidePage(window: Window): boolean {
    return (
        !!window.document.querySelector("body.guide.pogo") ||
        !!window.document.body.querySelector("#stick-map")
    );
}

/**
 * Checks if the current page is the homepage.
 * @returns Returns true if the current page is the homepage, false otherwise.
 */
export function isHomePage(window: Window): boolean {
    return window.location.href === "https://mapgenie.io/";
}

/**
 * Gets the type of the current page.
 * @returns Returns the type of the current page.
 */
export function getPageType(window: Window): PageType {
    if (isMapPage(window)) {
        return "map";
    } else if (isGuidePage(window)) {
        return "guide";
    } else if (isHomePage(window)) {
        return "home";
    }
    return "unknown";
}
