import { waitForBody, waitForHead } from "@shared/dom";

export type PageType =
    | "map"
    | "guide"
    | "home"
    | "map-selector"
    | "unknown";

/**
 * Checks if the current page is a map page.
 * @returns Returns true if the current page is a map page, false otherwise.
 */
export async function isMapPage(window: Window): Promise<boolean> {
    waitForHead(window);
    return true
        && !!window.document.head.querySelector("meta[property='og:image'][content^='https://cdn.mapgenie.io/']")
        && !!document.head.querySelector("meta[property='og:title'][content~='Map']");
}

/**
 * Checks if the current page is a guide page.
 * @returns Returns true if the current page is a guide page, false otherwise.
 */
export async function isGuidePage(window: Window): Promise<boolean> {
    waitForHead(window);
    return true
        &&!!window.document.head.querySelector("meta[property='og:image'][content^='https://cdn.mapgenie.io/']")
        &&!!window.document.head.querySelector("meta[property='og:url'][content*='guides']");
}

/**
 * Checks if the current page is the homepage.
 * @returns Returns true if the current page is the homepage, false otherwise.
 */
export async function isHomePage(window: Window): Promise<boolean> {
    return window.location.href === "https://mapgenie.io/";
}

/**
 * Check if the current page is a map selector page.
 * @returns Returns true if the current page is a map selector page, false otherwise.
 */
export async function isMapSelectorPage(window: Window): Promise<boolean> {
    waitForHead(window);
    return true
        && !!window.document.head.querySelector("meta[property='og:image'][content^='https://cdn.mapgenie.io/']")
        && !!window.document.head.querySelector("meta[property='og:title'][content~='Map']")
        && !window.document.head.querySelector("meta[property='og:url'][content*=");
}

/**
 * Gets the type of the current page.
 * @returns Returns the type of the current page.
 */
export async function getPageType(window: Window): Promise<PageType> {
    if (await isMapPage(window)) {
        return "map";
    } else if (await isGuidePage(window)) {
        return "guide";
    } else if (await isHomePage(window)) {
        return "home";
    } else if (await isMapSelectorPage(window)) {
        return "map-selector";
    }
    return "unknown";
}
