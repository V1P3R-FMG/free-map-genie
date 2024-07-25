import Channel, { type ChannelMessage } from "@shared/channel";
import runContexts from "@shared/run";

export function forwardMessage(
    sender: chrome.runtime.MessageSender,
    message: ChannelMessage
) {
    if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, message);
        return true;
    } else {
        logger.warn("Unalbe to forward message sender has no tab.id", sender);
        return false;
    }
}

export function logMessage(message: ChannelMessage) {
    logger.debug(
        "[FORWARDED CHANNEL MSG]",
        ...Channel.formatMessage(message.data)
    );
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
                break;
        }

        return false;
    });
}

runContexts("background", main);
