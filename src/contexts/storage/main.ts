import { Channels } from "@constants";
import Channel, { ResponseType } from "@shared/channel";
import { isIframeContext } from "@shared/context";
import runContexts from "@shared/run";
import * as s from "@shared/schema";

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

export type MessageScheme = s.Type<typeof messageScheme>;

async function main() {
    const params = new URLSearchParams(window.location.search);
    if (!isIframeContext() || !params.get("storage")) return false;

    const _ = Channel.port(Channels.Mapgenie, (message, sendResponse) => {
        const { type, data } = messageScheme.parse(message);
        switch (type) {
            case "has": {
                sendResponse(window.localStorage.getItem(data.key) != null);
                return ResponseType.Handled;
            }
            case "get": {
                sendResponse(window.localStorage.getItem(data.key));
                return ResponseType.Handled;
            }
            case "set": {
                window.localStorage.setItem(data.key, data.value);
                return ResponseType.Handled;
            }
            case "remove": {
                window.localStorage.removeItem(data.key);
                return ResponseType.Handled;
            }
            case "keys": {
                sendResponse(Object.keys(window.localStorage));
                return ResponseType.Handled;
            }
            default:
                return ResponseType.NotHandled;
        }
    });
}

runContexts("storage", main);
