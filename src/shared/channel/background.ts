import { createChannel } from "./internal";
import { createTarget } from "./internal/target";
import { decodeConnectionArgs, formatEndpointTargetName } from "./internal/connection-args";
import { hasMessageHop, hopMessage, isInternalMessage, isMessageOnTrace, logMessage } from "./internal/message";
import type { ConnectionArgsWithEndpoint, Fingerprint, InternalMessage } from "./internal/types";

export type * from "./internal/types";

console.log("hello bak");

export interface CachedPortInfo {
    port: chrome.runtime.Port;
    fingerprint: Fingerprint;
    context: string;
}

export interface ActiveTab {
    url?: string;
    id?: number;
}

const connMap: Map<string, CachedPortInfo> = new Map();

async function getActiveTab() {
    const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return tabs[0];
}

function postMessage(message: InternalMessage) {
    const endpointName = formatEndpointTargetName(message.target);
    connMap.get(endpointName)?.port.postMessage(message);
}

function logPort(connArgs: ConnectionArgsWithEndpoint, port: chrome.runtime.Port, action: string) {
    logger.log([
        `${action} port ${connArgs.endpointName}#${connArgs.fingerprint}.`,
        `name: ${port.name}`,
        `sender: ${port.sender}`
    ].join("\n"));
}

const channel = createChannel("background", {
    onMessage() {},
    postMessage,
    connect() {
        throw "Background is always connected";
    },
    disconnect() {
        throw "Background can't be disconnected";
    },
    state: "connected",
});

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port.sender?.tab?.id;
    const frameId = port.sender?.frameId;

    const connArgs = decodeConnectionArgs(port.name, { tabId, frameId });

    connMap.set(connArgs.endpointName, {
        context: connArgs.context,
        fingerprint: connArgs.fingerprint,
        port,
    });

    port.onMessage.addListener(async (message) => {
        if (!isInternalMessage(message)) {
            logger.warn("Not a valid channel message", message, "from port", port.name);
            return;
        }

        message.sender.tabId ??= tabId;
        message.sender.frameId ??= frameId;

        if (isMessageOnTrace(["popup", "offscreen", "background"], ["extension", "content-script"], message)) {
            message.target.tabId ??= (await getActiveTab())?.id;
            message.target.frameId ??= 0;
        } else if (isMessageOnTrace(["extension", "content-script"], ["extension", "content-script"], message)) {
            message.target.tabId ??= tabId;
            message.target.frameId ??= frameId;
        }

        if (channel.isMessageForMe(message)) {
            channel.handleMessage(message);
            return;
        }

        if (hasMessageHop(message, "background")) return;

        logMessage(message);

        postMessage(hopMessage(message, "background"));
    });

    port.onDisconnect.addListener(() => {
        if (connMap.get(connArgs.endpointName)?.fingerprint === connArgs.fingerprint) {
            connMap.delete(connArgs.endpointName);

            logPort(connArgs, port, "-");
        }
    });

    logPort(connArgs, port, "+");
});

const { onMessage, sendMessage } = channel;

const sendExtension = channel.bindSendMessage("extension");
const sendContent = channel.bindSendMessage("content-script");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendPopup = channel.bindSendMessage("popup");

const extension = createTarget(sendMessage, "extension");
const content = createTarget(sendMessage, "content-script");
const offscreen = createTarget(sendMessage, "offscreen");
const popup = createTarget(sendMessage, "popup");

export default {
    onMessage,
    sendMessage,
    sendExtension,
    sendContent,
    sendOffscreen,
    sendPopup,
    extension,
    content,
    offscreen,
    popup,
    getActiveTab,
};
