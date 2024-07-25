import Channel from "@shared/channel";
import { Channels } from "@constants";
import validation from "@shared/validation";
import runContexts from "@shared/run";
import { injectExtensionScript } from "@shared/inject";

const MESSAGE_SCHEME = validation.scheme({ type: "string", data: "any" });

async function main() {
    const _ = Channel.window(
        Channels.Extension,
        (message, sendResponse, _sendError) => {
            const { type, data } = validation.check(MESSAGE_SCHEME, message);

            switch (type) {
                case "hello":
                    sendResponse("Hello from extension.js");
                    return true;
                default:
                    return false;
            }
        }
    );

    injectExtensionScript("content.js");
}

runContexts("extension", main);
