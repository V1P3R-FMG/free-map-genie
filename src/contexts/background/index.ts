import runContexts from "@shared/run";
import { onMessage, getActiveTab, type ChannelEventDef } from "@shared/channel/background";
import * as chromeUtils from "@utils/chrome";
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
            "latest:version": ChannelEventDef<void, string>;
            "start:login": ChannelEventDef<{ url: string }>;
            "login": ChannelEventDef<void, string>;
            "games": ChannelEventDef<void, MG.Api.Game[]>;
            "game": ChannelEventDef<{ gameId: number }, MG.Api.GameFull>;
            "map": ChannelEventDef<{ mapId: number }, MG.Api.MapFull>;
            "heatmaps": ChannelEventDef<{ mapId: number }, MG.Api.HeatmapGroup>;
            "games:find:game": ChannelEventDef<{ gameId: number }, MG.Api.Game | undefined>;
            "games:find:map": ChannelEventDef<{ mapId: number; gameId: number }, MG.Api.Map | undefined>;
            "games:find:game:from:slug": ChannelEventDef<{ gameSlug: string }, MG.Api.Game | undefined>;
            "games:find:map:from:slug": ChannelEventDef<{ gameSlug: string; mapSlug: string }, MG.Api.Map | undefined>;
            "games:find:game:from:domain": ChannelEventDef<{ domain: string }, MG.Api.Game | undefined>;
            "games:find:game:from:url": ChannelEventDef<{ url: string }, MG.Api.Game | undefined>;
            "games:find:map:from:url": ChannelEventDef<{ url: string }, MG.Api.Map | undefined>;
            "reload:active:tab": ChannelEventDef<void, boolean>;
            "reload:extension": ChannelEventDef;
            "open:popup": ChannelEventDef;
            "get:page:type": ChannelEventDef<{ url: string }, MG.PageType>;
            "create:bookmark": ChannelEventDef<void, BookmarkData>;
        };
    }
}

onMessage("latest:version", () => {
    return fetchLatestVersion();
});

onMessage("start:login", ({ url }) => {
    return chrome.storage.session.set({ last_mg_url: url });
});

onMessage("login", async () => {
    const { last_mg_url } = await chrome.storage.session.get("last_mg_url");
    return last_mg_url;
});

onMessage("games", () => {
    return Games.getGames();
});

onMessage("game", ({ gameId }) => {
    return Games.getGame(gameId);
});

onMessage("map", ({ mapId }) => {
    return Games.getMap(mapId);
});

onMessage("heatmaps", ({ mapId }) => {
    return Games.getHeatmaps(mapId);
});

onMessage("games:find:game", ({ gameId }) => {
    return Games.findGame(gameId);
});

onMessage("games:find:map", ({ gameId, mapId }) => {
    return Games.findMap(gameId, mapId);
});

onMessage("games:find:game:from:slug", ({ gameSlug }) => {
    return Games.findGameFromSlug(gameSlug);
});

onMessage("games:find:map:from:slug", ({ gameSlug, mapSlug }) => {
    return Games.findMapFromSlug(gameSlug, mapSlug);
});

onMessage("games:find:game:from:domain", ({ domain }) => {
    return Games.findGameFromDomain(domain);
});

onMessage("games:find:game:from:url", ({ url }) => {
    return Games.findGameFromUrl(url);
});

onMessage("games:find:map:from:url", ({ url }) => {
    return Games.findMapFromUrl(url);
});

onMessage("reload:active:tab", async () => {
    const tab = await chromeUtils.getActiveTab();

    if (!tab?.id) return false;

    await chrome.tabs.reload(tab.id);

    return true;
});

onMessage("reload:extension", () => {
    chrome.runtime.reload();
});

onMessage("open:popup", async () => {
    await chrome.action.openPopup();
});

onMessage("get:page:type", async ({ url }) => {
    logging.debug("Getting page type", url, await getPageType(url));
    return getPageType(url);
});

onMessage("create:bookmark", () => {
    const activeTab = getActiveTab();
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
