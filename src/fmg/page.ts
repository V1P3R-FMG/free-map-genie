export type MageniePageType = "home" | "login" | "map" | "guide" | "game-home" | "unknown";

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

export function getPageType(): MageniePageType {
    if (!isMapgeniePage()) return "unknown";

    if (isMapgenieHomePage()) return "home";
    if (isMapgenieLoginPage()) return "login";
    if (isMapgenieMapPage()) return "map";
    if (isMapgenieGuidePage()) return "guide";
    if (isMapgenieGameHomePage()) return "game-home";

    return "unknown";
}

export async function waitForPageType(timeout?: number): Promise<MageniePageType> {
    let pageType: MageniePageType = getPageType();

    if (pageType !== "unknown") return pageType;

    return Promise.waitForCondition(() => (pageType = getPageType()) !== "unknown", {
        interval: 0,
        timeout,
    })
        .then(() => pageType)
        .catch(() => "unknown");
}
