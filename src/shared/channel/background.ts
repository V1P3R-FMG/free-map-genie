import { getActiveTabId } from "@utils/chrome";

import { createChannel } from "./internal";
import { decodeConnectionArgs, formatEndpointName, formatEndpointTargetName } from "./internal/connection-args";
import { hasMessageHop, hopMessage, isInternalMessage, isMessageFor, isMessageFrom } from "./internal/message";
import type { Fingerprint, InternalMessage } from "./internal/types";

export type * from "./internal/types";

const connMap: Map<
    string,
    {
        port: chrome.runtime.Port;
        fingerprint: Fingerprint;
        context: string;
    }
> = new Map();

function postMessage(message: InternalMessage) {
    if (message.type === "inject:style") {
        logging.debug(message, formatEndpointTargetName(message.target));
    }
    connMap
        .get(
            ///
            formatEndpointTargetName(message.target)
        )
        ?.port.postMessage(message);
}

const channel = createChannel("background", {
    onMessage: (cb) => chrome.runtime.onMessage.addListener(cb),
    postMessage,
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (typeof message === "object" && message.type === "tabId") {
        sendResponse(sender.tab?.id);
        return true;
    }

    logging.warn("Invalid background message", message);
    return false;
});

chrome.runtime.onConnect.addListener((port) => {
    const tabId = port.sender?.tab?.id;
    const frameId = port.sender?.frameId;

    const connArgs = decodeConnectionArgs(port.name, { tabId, frameId });

    if (connMap.get(connArgs.endpointName)?.fingerprint === connArgs.fingerprint) {
        return;
    }

    connMap.set(connArgs.endpointName, {
        context: connArgs.context,
        fingerprint: connArgs.fingerprint,
        port,
    });

    port.onMessage.addListener(async (message) => {
        if (!isInternalMessage(message)) {
            logging.warn("Not a valid channel message", message, "from port", port.name);
            return;
        }

        message.sender.tabId ??= tabId;
        message.sender.frameId ??= frameId;

        if (
            isMessageFor(["extension", "content-script"], message) ||
            isMessageFrom(["popup", "offscreen", "background"], message)
        ) {
            message.target.tabId ??= tabId || (await getActiveTabId());
            message.target.frameId ??= 0;
        }

        if (channel.isMessageForMe(message)) {
            channel.handleMessage(message);
            return;
        }

        if (hasMessageHop(message, "background")) return;

        logging.debug(
            `message#${message.messageId} [${message.messageType.toUpperCase()}] forwarded`,
            `[${formatEndpointName(message.sender)} -> ${formatEndpointName(message.target)}]`,
            "[",
            `type: '${message.type}'`,
            "| data:",
            message.data,
            "]"
        );

        postMessage(hopMessage(message, "background"));
    });

    port.onDisconnect.addListener(() => {
        if (connMap.get(connArgs.endpointName)?.fingerprint === connArgs.fingerprint) {
            connMap.delete(connArgs.endpointName);
            logging.debug(`Port removed ${connArgs.endpointName}#${connArgs.fingerprint}.`, port.name, port.sender);
        }
    });

    logging.debug(`Port added ${connArgs.endpointName}#${connArgs.fingerprint}.`, port.name, port.sender);
});

if (__DEBUG__) {
    global.getConnections = () => connMap;
}

export const { onMessage, sendMessage } = channel;
