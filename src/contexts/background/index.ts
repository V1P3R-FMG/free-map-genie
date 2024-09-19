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

async function handleAsync(promise: Promise<any>, sendResponse: (response?: any) => void) {
    try {
        sendResponse(await promise);
    } catch (err) {
        logging.error(err);
    }
}

async function main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        try {
            const { type, data } = messageScheme.parse(message);

            switch (type) {
                case "channel":
                    forwardMessage(sender, data)
                        .then((forwarded) => forwarded && logMessage(data, sender))
                        .then((_) => sendResponse({ success: true }))
                        .catch((err) => sendResponse({ success: false, data: `${err}` }));
                    return true;
                case "start:login":
                    chrome.storage.session.set({ last_mg_url: data });
                    return false;
                case "login":
                    return handleAsync(
                        chrome.storage.session.get("last_mg_url").then(({ last_mg_url }) => last_mg_url),
                        sendResponse
                    );
                case "games":
                    handleAsync(Games.getGames(), sendResponse);
                    return true;
                case "game":
                    handleAsync(Games.getGame(data.gameId), sendResponse);
                    return true;
                case "map":
                    handleAsync(Games.getMap(data.mapId), sendResponse);
                    return true;
                case "heatmaps":
                    handleAsync(Games.getHeatmaps(data.mapId), sendResponse);
                    return true;
                case "games:find:game":
                    handleAsync(Games.findGame(data.gameId), sendResponse);
                    return true;
                case "games:find:map":
                    handleAsync(Games.findMap(data.gameId, data.mapId), sendResponse);
                    return true;
                default:
                    return false;
            }
        } catch (err) {
            if (err instanceof s.SchemaError) return false;
            throw err;
        }
    });

    await installRules();
    await createStorageIframe();
}

runContexts("background", main);
