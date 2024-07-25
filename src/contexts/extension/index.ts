import Channel from "@shared/channel";
import { Channels } from "@constants";
import validation from "@shared/validation";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";
import AdBlocker from "./ads";
import initStorage, { get, set } from "./storage";

const MESSAGE_SCHEME = validation.scheme({ type: "string", data: "any" });

function setLoginDestinationURL(url?: string) {
    if (url) return (window.location.href = url);

    const location = new URL(window.location.href);
    location.search = "";

    if (location.pathname.endsWith("/login")) {
        window.location.href = location.href.split("/").slice(0, -1).join("/");
        return;
    }

    window.location.href = "https://mapgenie.io";
}

async function main() {
    const _ = Channel.window(
        Channels.Extension,
        (message, sendResponse, sendError) => {
            const { type } = validation.check(MESSAGE_SCHEME, message);

            switch (type) {
                case "games":
                case "game":
                case "game::map":
                    chrome.runtime
                        .sendMessage(message)
                        .then(sendResponse)
                        .catch(sendError);
                    return true;
                case "start:login":
                    chrome.runtime.sendMessage(message);
                    return false;
                case "login":
                    chrome.runtime
                        .sendMessage(message)
                        .then(setLoginDestinationURL);
                    return false;
                default:
                    return false;
            }
        }
    );

    await set("hello", "world");

    logger.debug(
        "Mapgenie Iframe Send data for key 'hello'",
        await get("hello")
    );

    injectExtensionScript("content.js");

    // AdBlocker.onTick(logger.debug.bind("FMG AdBlocker stats:"));
    AdBlocker.start();
    AdBlocker.removePrivacyPopup();
}

runContexts("extension", initStorage, main);
