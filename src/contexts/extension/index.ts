import Channel, { ResponseType } from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";
import { injectExtensionScript, injectStyle } from "@shared/inject";
import * as s from "@shared/schema";

const forwardedMessagesScheme = s.object({
    type: s.union([
        s.literal("games"),
        s.literal("games:find:game"),
        s.literal("games:find:map"),
        s.literal("game"),
        s.literal("map"),
        s.literal("heatmaps"),
        s.literal("start:login"),
        s.literal("login"),
        s.literal("has"),
        s.literal("get"),
        s.literal("set"),
        s.literal("remove"),
        s.literal("keys"),
    ]),
    data: s.any(),
});

const extensionMessageScheme = s.union([
    s.object({
        type: s.literal("asset"),
        data: s.string(),
    }),
    s.object({
        type: s.literal("inject:style"),
        data: s.string(),
    }),
]);

const messageScheme = s.union([forwardedMessagesScheme, extensionMessageScheme]);

export type MessageScheme = s.Type<typeof extensionMessageScheme>;

import AdBlocker from "./ads";

// const MESSAGE_SCHEME = validation.validator({ type: "string", data: "any" });

async function main() {
    // AdBlocker.onTick(logging.debug.bind("FMG AdBlocker stats:"));
    AdBlocker.start();
    AdBlocker.removePrivacyPopup();

    const channel = Channel.extension(Channels.Extension);
    const _ = Channel.window(Channels.Extension, (e, sendResponse, sendError) => {
        const message = messageScheme.parse(e);
        const { type, data } = message;

        switch (type) {
            case "games":
            case "games:find:game":
            case "games:find:map":
            case "game":
            case "map":
            case "heatmaps":
                chrome.runtime.sendMessage({ type, data }).then(sendResponse).catch(sendError);
                return ResponseType.Pending;
            case "start:login":
                chrome.runtime.sendMessage({ type, data });
                return ResponseType.Handled;
            case "login":
                chrome.runtime.sendMessage({ type, data }).then((url?: string) => {
                    if (url) return (window.location.href = url);

                    const location = new URL(window.location.href);
                    location.search = "";

                    if (location.pathname.endsWith("/login")) {
                        window.location.href = location.href.split("/").slice(0, -1).join("/");
                        return;
                    }

                    window.location.href = "https://mapgenie.io";
                });
                return ResponseType.Handled;
            case "asset":
                const path = data.replace(/^\//, "");
                const url = ["assets", path].join("/");
                sendResponse(chrome.runtime.getURL(url));
                return ResponseType.Handled;
            case "inject:style":
                injectStyle(chrome.runtime.getURL(data)).then(sendResponse).catch(sendError);
                return ResponseType.Pending;
            case "has":
            case "get":
            case "set":
            case "remove":
            case "keys":
                channel.send(Channels.Mapgenie, message).then(sendResponse).catch(sendError);
                return ResponseType.Pending;
            default:
                return ResponseType.NotHandled;
        }
    });

    injectExtensionScript("content.js");
}

runContexts("extension", main);
