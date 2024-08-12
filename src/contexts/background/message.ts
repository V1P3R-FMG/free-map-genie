import { Channels } from "@constants";
import Channel, { type ChannelMessage } from "@shared/channel";

export function forwardMessage(sender: chrome.runtime.MessageSender, message: ChannelMessage): boolean {
    const tabId = message.tabId || sender.tab?.id;
    if (message.target === Channels.Mapgenie) {
        //chrome.runtime.sendMessage(message);
        return false;
    } else if (tabId) {
        chrome.tabs.sendMessage(tabId, {
            origin: sender.origin,
            data: message,
        });
        return true;
    } else {
        logging.warn("Unable to forward message sender has no tab.id", sender);
        return false;
    }
}

export function logMessage(message: ChannelMessage) {
    logging.debug("[FORWARDED CHANNEL MSG]", ...Channel.formatMessage(message));
}
