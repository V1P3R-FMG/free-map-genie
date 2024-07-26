import Channel from "@shared/channel";
import { Channels } from "@constants";
import validation from "@shared/validation";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";

import AdBlocker from "./ads";
import initStorage, { get, set } from "./storage";

const MESSAGE_SCHEME = validation.validator({ type: "string", data: "any" });

async function main() {
    // AdBlocker.onTick(logger.debug.bind("FMG AdBlocker stats:"));
    AdBlocker.start();
    AdBlocker.removePrivacyPopup();

    const _ = Channel.window(Channels.Extension, (message, sendResponse, sendError) => {
        const { type } = MESSAGE_SCHEME(message);

        switch (type) {
            case "games":
            case "game":
            case "game::map":
                chrome.runtime.sendMessage(message).then(sendResponse).catch(sendError);
                return true;
            case "start:login":
                chrome.runtime.sendMessage(message);
                return false;
            case "login":
                chrome.runtime.sendMessage(message).then((url?: string) => {
                    if (url) return (window.location.href = url);

                    const location = new URL(window.location.href);
                    location.search = "";

                    if (location.pathname.endsWith("/login")) {
                        window.location.href = location.href.split("/").slice(0, -1).join("/");
                        return;
                    }

                    window.location.href = "https://mapgenie.io";
                });
                return false;
            default:
                return false;
        }
    });

    injectExtensionScript("content.js");

    await set("hello", "world");

    logger.debug("Mapgenie Iframe Send data for key 'hello'", await get("hello"));
}

runContexts("extension", initStorage, main);
