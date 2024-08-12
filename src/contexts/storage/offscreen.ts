import { Channels } from "@constants";
import runContexts from "@shared/run";

async function main() {
    chrome.runtime.onConnect.addListener((port) => {
        if (port.name !== Channels.Mapgenie) return;

        logging.debug("Mapgenie iframe port connected");

        port.onMessage.addListener((message) => chrome.runtime.sendMessage(message));

        chrome.runtime.onMessage.addListener((message, sender) => {
            if (typeof message === "object" && message.type === "channel") {
                port.postMessage({
                    tabId: sender.tab?.id,
                    origin: sender.origin,
                    data: message.data,
                });
            }
        });
    });
}

runContexts("storage-offscreen", main);
