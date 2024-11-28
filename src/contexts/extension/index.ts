import runContexts from "@shared/run";
import { injectExtensionScript, injectStyle } from "@shared/inject";
import { isIframeContext } from "@shared/context";
import channel from "@shared/channel/extension";

import AdBlocker from "./ads";

declare global {
    export interface Channels {
        extension: {
            injectStyle(data: { path: string }): void;
            getAsset(data: { path: string }): string;
            login(): void;
            ping(): "pong";
        };
    }
}

function getAsset(path: string) {
    path = path.replace(/^\//, "");
    const url = ["assets", path].join("/");
    return chrome.runtime.getURL(url);
}

async function startAdBlocker() {
    switch (await channel.background.getPageType({ url: window.location.href })) {
        case "map":
            AdBlocker.start();

            if (__DEBUG__) {
                AdBlocker.onTick(logging.debug.bind("FMG AdBlocker stats:"));
                AdBlocker.removePrivacyPopup();
            }
    }
}

channel.onMessage("login", async () => {
    const url = await channel.background.login();

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

channel.onMessage("injectStyle", async ({ path }) => {
    await injectStyle(chrome.runtime.getURL(path));
});

channel.onMessage("getAsset", ({ path }) => {
    return getAsset(path);
});

channel.onMessage("ping", () => {
    return "pong" as const;
});

async function main() {
    if (isIframeContext()) {
        return false;
    }

    channel.connect();
    console.log(await channel.background.gamesFindGame({ gameId: 20 }));

    const pageType = await channel.background.getPageType({ url: window.location.href });
    logging.debug("Page type", pageType);

    if (pageType === "unknown") {
        channel.disconnect();
        return false;
    }

    startAdBlocker().catch(logging.error);

    injectExtensionScript("content.js");
}

runContexts("extension", main);
