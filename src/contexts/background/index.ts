import Channel, { type ChannelMessage } from "@shared/channel";
import runContexts from "@shared/run";
import installRules from "./rules";

export function forwardMessage(
    sender: chrome.runtime.MessageSender,
    message: ChannelMessage
) {
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
        if (typeof message !== "object" || !message.type) {
            logger.warn("Invalid message", message);
            return false;
        }

        switch (message.type) {
            case "channel":
                if (forwardMessage(sender, message.data)) {
                    logMessage(message.data);
                }
                return false;
            case "start:login":
                logger.debug("start:login", message.data);
                chrome.storage.session.set({ last_mg_url: message.data });
                return false;
            case "login":
                chrome.storage.session
                    .get("last_mg_url")
                    .then(
                        ({ last_mg_url }) => (
                            logger.debug("login", last_mg_url),
                            sendResponse(last_mg_url)
                        )
                    );
                return true;
            default:
                return false;
        }
    });
}

runContexts("background", installRules, main);
