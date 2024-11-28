import runContexts from "@shared/run";
import * as chromeUtils from "@utils/chrome";
import channel from "@shared/channel/background";
import type { BookmarkData } from "@ui/components/bookmarks/bookmark-button.vue";

import installRules from "./rules";
import createStorageIframe from "./storage";
import fetchLatestVersion from "./version";
import getPageType from "./page";
import Games from "./games";
import createBookmark from "./bookmarks";

declare global {
    export interface Channels {
        background: {
            getLatestVersion(): string;
            startLogin(data: { url: string }): void;
            login(): string;

            getGames(): MG.Api.Game[];

            getGame(data: { gameId: number }): MG.Api.GameFull;
            getMap(data: { mapId: number }): MG.Api.MapFull;
            getHeatmaps(data: { mapId: number }): MG.Api.HeatmapGroup[];

            gamesFindGame(data: { gameId: number }): MG.Api.Game | void;

            gamesFindMap(data: { mapId: number; gameId: number }): MG.Api.Map | void;

            gamesFindGameFromSlug(data: { gameSlug: string }): MG.Api.Game | void;

            gamesFindMapFromSlug(data: { gameSlug: string; mapSlug: string }): MG.Api.Map | void;

            gamesFindGameFromDomain(data: { domain: string }): MG.Api.Game | void;

            gamesFindGameFromUrl(data: { url: string }): MG.Api.Game | void;
            gamesFindMapFromUrl(data: { url: string }): MG.Api.Map | void;

            reloadActiveTab(): boolean;
            reloadExtension(): void;

            openPopup(): void;
            getPageType(data: { url: string }): MG.PageType;
            createBookmark(): BookmarkData;
        };
    }
}

channel.onMessage("getLatestVersion", () => {
    return fetchLatestVersion();
});

channel.onMessage("startLogin", ({ url }) => {
    return chrome.storage.session.set({ last_mg_url: url });
});

channel.onMessage("login", async () => {
    const { last_mg_url } = await chrome.storage.session.get("last_mg_url");
    return last_mg_url;
});

channel.onMessage("getGames", () => {
    return Games.getGames();
});

channel.onMessage("getGame", ({ gameId }) => {
    return Games.getGame(gameId);
});

channel.onMessage("getMap", ({ mapId }) => {
    return Games.getMap(mapId);
});

channel.onMessage("getHeatmaps", ({ mapId }) => {
    return Games.getHeatmaps(mapId);
});

channel.onMessage("gamesFindGame", ({ gameId }) => {
    return Games.findGame(gameId);
});

channel.onMessage("gamesFindMap", ({ gameId, mapId }) => {
    return Games.findMap(gameId, mapId);
});

channel.onMessage("gamesFindGameFromSlug", ({ gameSlug }) => {
    return Games.findGameFromSlug(gameSlug);
});

channel.onMessage("gamesFindMapFromSlug", ({ gameSlug, mapSlug }) => {
    return Games.findMapFromSlug(gameSlug, mapSlug);
});

channel.onMessage("gamesFindGameFromDomain", ({ domain }) => {
    return Games.findGameFromDomain(domain);
});

channel.onMessage("gamesFindGameFromUrl", ({ url }) => {
    return Games.findGameFromUrl(url);
});

channel.onMessage("gamesFindMapFromUrl", ({ url }) => {
    return Games.findMapFromUrl(url);
});

channel.onMessage("reloadActiveTab", async () => {
    const tab = (await chromeUtils.getActiveTab()) ?? channel.getActiveTab();

    if (!tab?.id) return false;

    await chrome.tabs.reload(tab.id);

    return true;
});

channel.onMessage("reloadExtension", () => {
    chrome.runtime.reload();
});

channel.onMessage("openPopup", async () => {
    await chrome.action.openPopup();
});

channel.onMessage("getPageType", async ({ url }) => {
    logging.debug("Getting page type", url, await getPageType(url));
    return getPageType(url);
});

channel.onMessage("createBookmark", async () => {
    const activeTab = (await chromeUtils.getActiveTab()) ?? channel.getActiveTab();
    if (!activeTab?.url) throw "Active tab url not found.";
    return createBookmark(activeTab.url);
});

async function main() {
    await installRules();

    if (__BROWSER__ === "chrome") {
        await createStorageIframe();
    }
}

runContexts("background", main);
