import runContexts from "@shared/run";
import { onMessage, type ChannelEventDef } from "@shared/channel/background";
import { getActiveTab } from "@utils/chrome";

import installRules from "./rules";
import createStorageIframe from "./storage";
import fetchLatestVersion from "./version";
import Games from "./games";

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
            "reload:active:tab": ChannelEventDef<void, boolean>;
            "reload:extension": ChannelEventDef;
            "open:popup": ChannelEventDef;
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

onMessage("reload:active:tab", async () => {
    const tab = await getActiveTab();

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

async function main() {
    await installRules();

    if (__BROWSER__ === "chrome") {
        await createStorageIframe();
    }
}

runContexts("background", main);
