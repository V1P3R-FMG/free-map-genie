import runContexts from "@shared/run";
import * as s from "@shared/schema";

import installRules from "./rules";
import createStorageIframe from "./storage";
import { forwardMessage, logMessage } from "./message";
import Games from "./games";

const messageScheme = s.union([
    s.object({
        type: s.literal("channel"),
        data: s.any(),
    }),
    s.object({
        type: s.literal("games"),
        data: s.literal(undefined),
    }),
    s.object({
        type: s.literal("games:find:game"),
        data: s.object({ gameId: s.number() }),
    }),
    s.object({
        type: s.literal("games:find:map"),
        data: s.object({ gameId: s.number(), mapId: s.number() }),
    }),
    s.object({
        type: s.literal("game"),
        data: s.object({ gameId: s.number() }),
    }),
    s.object({
        type: s.literal("map"),
        data: s.object({ mapId: s.number() }),
    }),
    s.object({
        type: s.literal("heatmaps"),
        data: s.object({ mapId: s.number() }),
    }),
    s.object({
        type: s.literal("start:login"),
        data: s.string(),
    }),
    s.object({
        type: s.literal("login"),
        data: s.literal(undefined),
    }),
]);

export type MessageScheme = s.Type<typeof messageScheme>;

async function main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            const { type, data } = messageScheme.parse(message);

            switch (type) {
                case "channel": {
                    if (forwardMessage(sender, data)) {
                        logMessage(data);
                    }
                    return false;
                }
                case "start:login": {
                    chrome.storage.session.set({ last_mg_url: data });
                    return false;
                }
                case "login": {
                    chrome.storage.session
                        .get("last_mg_url")
                        .then(({ last_mg_url }) => sendResponse(last_mg_url))
                        .catch(logging.error);
                    return true;
                }
                case "games": {
                    Games.getGames().then(sendResponse).catch(logging.error);
                    return true;
                }
                case "game": {
                    Games.getGame(data.gameId).then(sendResponse).catch(logging.error);
                    return true;
                }
                case "map": {
                    Games.getMap(data.mapId).then(sendResponse).catch(logging.error);
                    return true;
                }
                case "heatmaps": {
                    Games.getHeatmaps(data.mapId).then(sendResponse).catch(logging.error);
                    return true;
                }
                case "games:find:game": {
                    Games.findGame(data.gameId).then(sendResponse).catch(logging.error);
                    return true;
                }
                case "games:find:map": {
                    Games.findMap(data.gameId, data.mapId).then(sendResponse).catch(logging.error);
                    return true;
                }
                default:
                    return false;
            }
        } catch (err) {
            if (err instanceof s.SchemaError) return;
            throw err;
        }
    });

    await installRules();
    await createStorageIframe();
}

runContexts("background", main);
