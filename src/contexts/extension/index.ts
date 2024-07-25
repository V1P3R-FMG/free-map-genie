import Channel from "@shared/channel";
import { Channels } from "@constants";
import validation from "@shared/validation";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";
import AdBlocker from "./ads";
import initStorage, { get, set } from "./storage";

const MESSAGE_SCHEME = validation.scheme({ type: "string", data: "any" });

async function main() {
    const _ = Channel.window(
        Channels.Extension,
        (message, sendResponse, _sendError) => {
            const { type } = validation.check(MESSAGE_SCHEME, message);

            switch (type) {
                case "hello":
                    sendResponse("Hello from extension.js");
                    return true;
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
