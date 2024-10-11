import runContexts from "@shared/run";
import { injectExtensionScript, injectStyle } from "@shared/inject";
import { waitForPageType } from "@utils/fmg-page";
import { onMessage, sendMessage, ChannelEventDef } from "@shared/channel/extension";

import { createBookmark, type CreateBookmarkResult } from "./bookmarks";
import AdBlocker from "./ads";

declare global {
    export interface Channels {
        extension: {
            "inject:style": ChannelEventDef<{ path: string }>;
            "asset": ChannelEventDef<{ path: string }, string>;
            "login": ChannelEventDef;
            "ping": ChannelEventDef<void, "pong">;
            "bookmark:create": ChannelEventDef<void, CreateBookmarkResult>;
        };
    }
}

onMessage("login", async () => {
    const url = await sendMessage("background", "login", {});

    if (url) {
        window.location.href = url;
        return;
    }

    if (window.location.pathname.endsWith("/login")) {
        const location = new URL(window.location.href);
        location.search = "";
        window.location.href = location.href.split("/").slice(0, -1).join("/");
        return;
    }

    window.location.href = "https://mapgenie.io";
});

onMessage("inject:style", async ({ path }) => {
    await injectStyle(chrome.runtime.getURL(path));
});

onMessage("asset", ({ path }) => {
    return getAsset(path);
});

onMessage("ping", () => {
    return "pong" as const;
});

onMessage("bookmark:create", () => {
    return createBookmark();
});

function getAsset(path: string) {
    path = path.replace(/^\//, "");
    const url = ["assets", path].join("/");
    return chrome.runtime.getURL(url);
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
    if ((await waitForPageType()) === "unknown") return false;

    startAdBlocker().catch(logging.error);

    injectExtensionScript("content.js");
}

runContexts("extension", main);
