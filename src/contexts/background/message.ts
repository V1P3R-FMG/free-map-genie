import { Channels } from "@constants";
import Channel, { type ChannelMessage } from "@shared/channel";

function sendMessageToTab(tabId: number, sender: chrome.runtime.MessageSender, message: ChannelMessage) {
    chrome.tabs.sendMessage(tabId, {
        origin: sender.origin,
        data: message,
    });
    return true;
}

async function getActiveTabId() {
    const tabs = await chrome.tabs.query({ active: true });
    return tabs[0]?.id;
}

async function sendMessageToActiveTab(sender: chrome.runtime.MessageSender, message: ChannelMessage) {
    const tabId = await getActiveTabId();
    if (typeof tabId === "number") {
        chrome.tabs.sendMessage(tabId, {
            origin: sender.origin,
            data: message,
        });
        return true;
    } else {
        logging.warn("Failed to send message from popup active tab.id not found", sender);
        return false;
    }
}

export async function forwardMessage(sender: chrome.runtime.MessageSender, message: ChannelMessage): Promise<boolean> {
    const tabId = message.tabId || sender.tab?.id;
    if (message.target === Channels.Mapgenie) {
        return false;
    } else if (tabId) {
        return sendMessageToTab(tabId, sender, message);
    } else if (sender.url?.endsWith("popup/index.html")) {
        return sendMessageToActiveTab(sender, message);
    } else {
        logging.warn("Unable to forward message sender has no tab.id", sender);
        return false;
    }
}

export function logMessage(message: ChannelMessage) {
    logging.debug("[FORWARDED CHANNEL MSG]", ...Channel.formatMessage(message));
}
