import { TimeoutError, waitForCondition } from "@utils/async";

export type MapgeniePageType = "home" | "login" | "map" | "guide" | "game-home" | "unknown";

export function isMapgeniePage(): boolean {
    return $('link[href^="https://cdn.mapgenie.io/favicons"]', document.head).length > 0;
}

export function isMapgenieHomePage(): boolean {
    return window.location.href === "https://mapgenie.io/";
}

export function isMapgenieMapPage(): boolean {
    return $("body.map").length > 0;
}

export function isMapgenieGuidePage(): boolean {
    return $("body.guide").length > 0;
}

export function isMapgenieLoginPage(): boolean {
    return window.location.pathname.endsWith("/login");
}

export function isMapgenieGameHomePage(): boolean {
    return $("body.game-home").length > 0;
}

export function getPageType(): MapgeniePageType {
    if (!isMapgeniePage()) return "unknown";

    if (isMapgenieHomePage()) return "home";
    if (isMapgenieLoginPage()) return "login";
    if (isMapgenieMapPage()) return "map";
    if (isMapgenieGuidePage()) return "guide";
    if (isMapgenieGameHomePage()) return "game-home";

    return "unknown";
}

export async function waitForPageType(timeout?: number): Promise<MapgeniePageType> {
    let pageType: MapgeniePageType = getPageType();

    if (pageType !== "unknown") return pageType;

    try {
        await waitForCondition(() => (pageType = getPageType()) !== "unknown", {
            interval: 0,
            timeout,
        });
    } catch (e) {
        if (e instanceof TimeoutError) {
            return "unknown";
        }
        throw e;
    }

    return pageType;
}
