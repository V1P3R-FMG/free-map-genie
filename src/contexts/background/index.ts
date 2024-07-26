import Channel, { type ChannelMessage } from "@shared/channel";
import runContexts from "@shared/run";
import validation from "@shared/validation";

import installRules from "./rules";
import { getGames, getGame, getGameMap } from "./games";

const MESSAGE_SCHEME = validation.validator({ type: "string", data: "any" });

const GET_GAME_SCHEME = validation.validator({ gameId: "number" });
const GET_GAME_MAP_SCHEME = validation.validator({
    gameId: "number",
    mapId: "number",
});

const START_LOGIN_SCHEME = validation.validator("string");

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
        const { type, data } = MESSAGE_SCHEME(message);

        switch (type) {
            case "channel": {
                if (forwardMessage(sender, data)) {
                    logMessage(data);
                }
                return false;
            }
            case "start:login": {
                const last_mg_url = START_LOGIN_SCHEME(data);
                chrome.storage.session.set({ last_mg_url });
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
                const { gameId } = GET_GAME_SCHEME(data);
                getGame(gameId).then(sendResponse);
                return true;
            }
            case "game:map": {
                const { gameId, mapId } = GET_GAME_MAP_SCHEME(data);
                getGameMap(gameId, mapId).then(sendResponse);
                return true;
            }
            default:
                return false;
        }
    });
}

runContexts("background", installRules, main);
