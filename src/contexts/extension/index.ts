import Channel, { ResponseType } from "@shared/channel";
import { Channels } from "@constants";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";
import * as s from "@shared/schema";

const messageScheme = s.union([
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

import AdBlocker from "./ads";
import initStorage, { get, set } from "./storage";

// const MESSAGE_SCHEME = validation.validator({ type: "string", data: "any" });

async function main() {
    // AdBlocker.onTick(logger.debug.bind("FMG AdBlocker stats:"));
    AdBlocker.start();
    AdBlocker.removePrivacyPopup();

    const _ = Channel.window(Channels.Extension, (e, sendResponse, sendError) => {
        const { type, data } = messageScheme.parse(e);

        switch (type) {
            case "games":
            case "game":
            case "game:map":
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
            default:
                return ResponseType.NotHandled;
        }
    });

    injectExtensionScript("content.js");

    await set("hello", "world");

    logger.debug("Mapgenie Iframe Send data for key 'hello'", await get("hello"));
}

runContexts("extension", initStorage, main);
