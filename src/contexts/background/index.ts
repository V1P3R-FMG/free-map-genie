import Channel, { type ChannelMessage } from "@shared/channel";
import runContexts from "@shared/run";
import * as s from "@shared/schema";

import installRules from "./rules";
import { getGames, getGame, getGameMap } from "./games";

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
        type: s.literal("game"),
        data: s.object({ gameId: s.number() }),
    }),
    s.object({
        type: s.literal("game:map"),
        data: s.object({ gameId: s.number(), mapId: s.number() }),
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

export function forwardMessage(sender: chrome.runtime.MessageSender, message: ChannelMessage): boolean {
    if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
            origin: sender.origin,
            data: message,
        });
        return true;
    } else {
        logger.warn("Unable to forward message sender has no tab.id", sender);
        return false;
    }
}

export function logMessage(message: ChannelMessage) {
    logger.debug("[FORWARDED CHANNEL MSG]", ...Channel.formatMessage(message));
}

async function main() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
                chrome.storage.session.get("last_mg_url").then(({ last_mg_url }) => sendResponse(last_mg_url));
                return true;
            }
            case "games": {
                getGames().then(sendResponse);
                return true;
            }
            case "game": {
                getGame(data.gameId).then(sendResponse);
                return true;
            }
            case "game:map": {
                getGameMap(data.gameId, data.mapId).then(sendResponse);
                return true;
            }
            default:
                return false;
        }
    });
}

runContexts("background", installRules, main);
