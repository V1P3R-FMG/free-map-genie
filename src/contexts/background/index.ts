import runContexts from "@shared/run";
import * as chromeUtils from "@utils/chrome";
import channel from "@shared/channel/background";
import type { ChannelEventDef } from "@shared/channel/background";
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
            "get:games": ChannelEventDef<void, MG.Api.Game[]>;
            "get:game": ChannelEventDef<{ gameId: number }, MG.Api.GameFull>;
            "get:map": ChannelEventDef<{ mapId: number }, MG.Api.MapFull>;
            "get:heatmaps": ChannelEventDef<{ mapId: number }, MG.Api.HeatmapGroup[]>;
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

channel.onMessage("latest:version", () => {
    return fetchLatestVersion();
});

channel.onMessage("start:login", ({ url }) => {
    return chrome.storage.session.set({ last_mg_url: url });
});

channel.onMessage("login", async () => {
    const { last_mg_url } = await chrome.storage.session.get("last_mg_url");
    return last_mg_url;
});

channel.onMessage("get:games", () => {
    return Games.getGames();
});

channel.onMessage("get:game", ({ gameId }) => {
    return Games.getGame(gameId);
});

channel.onMessage("get:map", ({ mapId }) => {
    return Games.getMap(mapId);
});

channel.onMessage("get:heatmaps", ({ mapId }) => {
    return Games.getHeatmaps(mapId);
});

channel.onMessage("games:find:game", ({ gameId }) => {
    return Games.findGame(gameId);
});

channel.onMessage("games:find:map", ({ gameId, mapId }) => {
    return Games.findMap(gameId, mapId);
});

channel.onMessage("games:find:game:from:slug", ({ gameSlug }) => {
    return Games.findGameFromSlug(gameSlug);
});

channel.onMessage("games:find:map:from:slug", ({ gameSlug, mapSlug }) => {
    return Games.findMapFromSlug(gameSlug, mapSlug);
});

channel.onMessage("games:find:game:from:domain", ({ domain }) => {
    return Games.findGameFromDomain(domain);
});

channel.onMessage("games:find:game:from:url", ({ url }) => {
    return Games.findGameFromUrl(url);
});

channel.onMessage("games:find:map:from:url", ({ url }) => {
    return Games.findMapFromUrl(url);
});

channel.onMessage("reload:active:tab", async () => {
    const tab = (await chromeUtils.getActiveTab()) ?? channel.getActiveTab();

    if (!tab?.id) return false;

    await chrome.tabs.reload(tab.id);

    return true;
});

channel.onMessage("reload:extension", () => {
    chrome.runtime.reload();
});

channel.onMessage("open:popup", async () => {
    await chrome.action.openPopup();
});

channel.onMessage("get:page:type", async ({ url }) => {
    logging.debug("Getting page type", url, await getPageType(url));
    return getPageType(url);
});

channel.onMessage("create:bookmark", async () => {
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
