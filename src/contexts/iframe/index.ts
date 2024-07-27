import { Channels } from "@constants";
import Channel from "@shared/channel";
import runContexts from "@shared/run";
import s from "@shared/schema";

const messageScheme = s.union([
    s.object({
        type: s.literal("has"),
        data: s.object({ key: s.string() }),
    }),
    s.object({
        type: s.literal("get"),
        data: s.object({ key: s.string() }),
    }),
    s.object({
        type: s.literal("set"),
        data: s.object({ key: s.string(), value: s.string() }),
    }),
    s.object({
        type: s.literal("remove"),
        data: s.object({ key: s.string() }),
    }),
    s.object({
        type: s.literal("keys"),
        data: s.literal(undefined),
    }),
]);

async function main() {
    const origin = new URLSearchParams(window.location.search).get("origin");

    logger.debug("Localstorage script is loaded by origin:", origin);

    const channel = Channel.extension(Channels.Mapgenie, (message, sendResponse) => {
        const { type, data } = messageScheme.parse(message);
        switch (type) {
            case "has": {
                sendResponse(window.localStorage.getItem(data.key) != null);
            }
            case "get": {
                sendResponse(window.localStorage.getItem(data.key));
                return true;
            }
            case "set": {
                window.localStorage.setItem(data.key, data.value);
                return false;
            }
            case "remove": {
                window.localStorage.removeItem(data.key);
                return false;
            }
            case "keys": {
                sendResponse(Object.keys(window.localStorage));
                return true;
            }
            default:
                return false;
        }
    });

    if (origin) channel.allowOrigin(origin);
}

runContexts("iframe", main);
