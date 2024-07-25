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
    chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
        if (typeof message !== "object" || !message.type) {
            logger.warn("Invalid message", message);
            return false;
        }

        switch (message.type) {
            case "channel":
                if (forwardMessage(sender, message.data)) {
                    logMessage(message.data);
                }
                break;
        }

        return false;
    });
}

runContexts("background", installRules, main);
