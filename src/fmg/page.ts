export type PageType =
    | "map"
    | "guide"
    | "home"
    | "map-selector"
    | "upgrade"
    | "login"
    | "unknown";

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
 * Check if the current page is a map selector page.
 * @returns Returns true if the current page is a map selector page, false otherwise.
 */
export function isMapSelectorPage(window: Window): boolean {
    return (
        !!window.document.body.classList.contains("game-home") &&
        !!window.document.body.querySelector(".maps-container")
    );
}

/**
 * Check if page is a upgrade page.
 * @returns Returns true if the current page is a upgrade page, false otherwise.
 */
export function isUpgradePage(window: Window): boolean {
    return (
        window.location.pathname.endsWith("/upgrade") &&
        !!window.document.head.querySelector(
            "link[href*='https://cdn.mapgenie.io/']"
        )
    );
}

/**
 * Check if page is a login page.
 * @returns Returns true if the current page is a login page, false otherwise.
 */
export function isLoginPage(window: Window): boolean {
    return (
        window.location.pathname.endsWith("/login") &&
        !!window.document.head.querySelector(
            "link[href*='https://cdn.mapgenie.io/']"
        )
    );
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
    } else if (isMapSelectorPage(window)) {
        return "map-selector";
    } else if (isUpgradePage(window)) {
        return "upgrade";
    } else if (isLoginPage(window)) {
        return "login";
    }
    return "unknown";
}
