import { injectExtensionScript, injectStyle } from "@shared/inject";
import Channel, { ResponseType, type SendCallback } from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";
import * as s from "@shared/schema";
import { getPageType, waitForPageType, type MapgeniePageType } from "@utils/fmg-page";

import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

import { forwardBackground, forwardStorage, forwardContent } from "./forward";
import AdBlocker from "./ads";
import { isIframeContext } from "@shared/context";

// Messages that need to be forwarded to background context
export const forwardedBackgroundMessageScheme = s.object({
    type: s.union([
        s.literal("games"),
        s.literal("games:find:game"),
        s.literal("games:find:map"),
        s.literal("game"),
        s.literal("map"),
        s.literal("heatmaps"),
        s.literal("start:login"),
        s.literal("login"),
        s.literal("start:login"),
        s.literal("login"),
    ]),
    data: s.any(),
});

// Messages that need to be forwarded to storage context
export const forwardedStorageMessagesScheme = s.object({
    type: s.union([s.literal("has"), s.literal("get"), s.literal("set"), s.literal("remove"), s.literal("keys")]),
    data: s.any(),
});

// Messages that need to be forwarded to content context
export const forwardedContentMessageScheme = s.union([
    s.object({
        type: s.union([s.literal("settings"), s.literal("create-bookmark")]),
        data: s.any(),
    }),
]);

// Messages that gets handled by the extension context
export const thisMessageScheme = s.union([
    s.object({
        type: s.literal("asset"),
        data: s.string(),
    }),
    s.object({
        type: s.literal("inject:style"),
        data: s.string(),
    }),
]);

// Messages that gets send over in web-extension env
export const extensionMessageScheme = s.union([forwardedContentMessageScheme]);

// Messages that gets send in the window env
export const windowMessageScheme = s.union([
    forwardedBackgroundMessageScheme,
    forwardedStorageMessagesScheme,
    thisMessageScheme,
]);

export type ExtensionMessageScheme = s.Type<typeof extensionMessageScheme>;
export type WindowMessageScheme = s.Type<typeof windowMessageScheme>;

async function handleAsync(promise: Promise<any>, sendResponse: SendCallback, sendError: SendCallback) {
    try {
        sendResponse(await promise);
    } catch (err) {
        sendError(err);
    }
}

function getAsset(path: string) {
    path = path.replace(/^\//, "");
    const url = ["assets", path].join("/");
    return chrome.runtime.getURL(url);
}

async function restorePreLoginPageHref(data: any) {
    const url = await chrome.runtime.sendMessage({ type: "login", data });

    if (url) {
        window.location.href = url;
        return ResponseType.Handled;
    }

    if (window.location.pathname.endsWith("/login")) {
        const location = new URL(window.location.href);
        location.search = "";
        window.location.href = location.href.split("/").slice(0, -1).join("/");
        return ResponseType.Handled;
    }

    window.location.href = "https://mapgenie.io";
}

function getMeta(name: string) {
    const content = document.querySelector(`head > meta[property='${name}']`)?.getAttribute("content");
    if (!content) {
        throw `meta[${name}] not found.`;
    }
    return content;
}

function getAppleTouchIcon() {
    const href = document.querySelector("head > link[rel='apple-touch-icon']")?.getAttribute("href");
    if (!href) {
        throw `apple touch icon not found.`;
    }
    return href;
}

function getLocationUrl() {
    const params = new URLSearchParams(window.location.search);
    const url = new URL(window.location.pathname, window.location.origin);

    if (params.has("map-slug")) {
        url.searchParams.append("map-slug", params.get("map-slug")!);
    }

    return url.toString();
}

async function getIconForPageType(pageType: MapgeniePageType) {
    switch (pageType) {
        case "guide":
            return chrome.runtime.getURL("assets/images/checklist.png");
        case "game-home":
            return chrome.runtime.getURL("assets/images/home.png");
        default:
            return undefined;
    }
}

export type CreateBookmarkResult = { success: true; data: BookmarkData } | { success: false; data: string };

async function createBookmark(): Promise<CreateBookmarkResult> {
    const pageType = getPageType();

    switch (pageType) {
        case "map":
            const mapInfo: MG.Map | undefined = await forwardContent({ type: "map", data: undefined });
            if (!mapInfo) {
                return {
                    success: false,
                    data: "failed to create bookmark, window.mapData.map not found.",
                };
            }

            const map: MG.Api.MapFull = await forwardBackground({
                type: "map",
                data: { mapId: mapInfo.id },
            });

            if (!map) {
                return {
                    success: false,
                    data: `failed to create bookmark, map with id ${mapInfo.id} not found`,
                };
            }

            try {
                return {
                    success: true,
                    data: {
                        title: map.meta_title ?? map.title,
                        url: getLocationUrl(),
                        icon: getAppleTouchIcon(),
                        preview: map.image ?? undefined,
                    },
                };
            } catch (err) {
                return {
                    success: false,
                    data: `failed to create bookmark, ${err}.`,
                };
            }
        case "guide":
        case "game-home":
        case "home":
            const icon = await getIconForPageType(pageType);
            try {
                return {
                    success: true,
                    data: {
                        title: getMeta("og:title"),
                        url: getLocationUrl(),
                        icon: icon ?? getAppleTouchIcon(),
                        preview: icon && getAppleTouchIcon(),
                    },
                };
            } catch (err) {
                return {
                    success: false,
                    data: `failed to create bookmark, ${err}.`,
                };
            }
        case "unknown":
        case "login":
        default:
            return {
                success: false,
                data: `Unable to create bookmark for current page type ${pageType}.`,
            };
    }
}

async function startAdBlocker() {
    switch (await waitForPageType()) {
        case "map":
            AdBlocker.start();

            if (__DEBUG__) {
                AdBlocker.onTick(logging.debug.bind("FMG AdBlocker stats:"));
                AdBlocker.removePrivacyPopup();
            }
    }
}

async function main() {
    startAdBlocker().catch(logging.error);

    if (!isIframeContext()) {
        Channel.extension(Channels.Extension, (e, sendResponse, sendError) => {
            const message = extensionMessageScheme.parse(e);
            const { type } = message;

            switch (type) {
                case "settings":
                    handleAsync(forwardContent(message as any), sendResponse, sendError);
                    return ResponseType.Pending;
                case "create-bookmark":
                    handleAsync(createBookmark(), sendResponse, sendError);
                    return ResponseType.Pending;
                default:
                    return ResponseType.NotHandled;
            }
        });
    }

    Channel.window(Channels.Extension, (e, sendResponse, sendError) => {
        const message = windowMessageScheme.parse(e);
        const { type, data } = message;

        switch (type) {
            case "games":
            case "games:find:game":
            case "games:find:map":
            case "game":
            case "map":
            case "heatmaps":
            case "start:login":
                handleAsync(forwardBackground(message), sendResponse, sendError);
                return ResponseType.Pending;
            case "login":
                handleAsync(restorePreLoginPageHref(data), sendResponse, sendError);
                return ResponseType.Pending;
            case "asset":
                sendResponse(getAsset(data));
                return ResponseType.Handled;
            case "inject:style":
                handleAsync(injectStyle(chrome.runtime.getURL(data)), sendResponse, sendError);
                return ResponseType.Pending;
            case "has":
            case "get":
            case "set":
            case "remove":
            case "keys":
                handleAsync(forwardStorage(message), sendResponse, sendError);
                return ResponseType.Pending;
            default:
                return ResponseType.NotHandled;
        }
    });

    injectExtensionScript("content.js");
}

runContexts("extension", main);
