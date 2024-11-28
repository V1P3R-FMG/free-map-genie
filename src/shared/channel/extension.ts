import { onDocumentFocusChanged } from "@shared/event";
import { isIframeContext } from "@shared/context";

import { createChannel } from "./internal";
import { createTarget } from "./internal/target";
import { createFingerprint } from "./internal/fingerprint";
import { hasMessageHop, hopMessage, isInternalMessage, isMessageFor } from "./internal/message";

import createWindowChannelDriver from "./internal/drivers/window";
import createPortChannelDriver from "./internal/drivers/port";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const win = createWindowChannelDriver(window);
const port = createPortChannelDriver("extension", fingerprint);

const channel = createChannel("extension", {
    onMessage: port.onMessage,
    postMessage: port.postMessage,
    connect() {
        win.connect();
        port.connect();
    },
    disconnect() {
        win.disconnect();
        port.disconnect();
    },
    get state() {
        return port.state;
    },
});

port.onMessage((message) => {
    if (!isInternalMessage(message)) return;
    if (!isMessageFor("content-script", message)) return;

    win.postMessage(hopMessage(message, "background"));
});

win.onMessage(async (message) => {
    if (!isInternalMessage(message)) return;

    if (hasMessageHop(message, "background")) return;

    if (channel.isMessageForMe(message)) {
        channel.handleMessage(message);
        return;
    }

    port.postMessage(message);
});

onDocumentFocusChanged((visible) => {
    if (isIframeContext()) return;

    if (visible) chrome.runtime.sendMessage({ type: "focused" });
});

setTimeout(() => {
    if (isIframeContext()) return;
    if (document.visibilityState === "hidden") return;

    logging.debug("Document is focused, sending focused message");
    chrome.runtime.sendMessage({ type: "focused" });
}, 500);

const { onMessage, sendMessage, connect, disconnect } = channel;

const sendContent = channel.bindSendMessage("content-script");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendBackground = channel.bindSendMessage("background");
const sendPopup = channel.bindSendMessage("popup");

const content = createTarget(sendMessage, "content-script");
const offscreen = createTarget(sendMessage, "offscreen");
const background = createTarget(sendMessage, "background");
const popup = createTarget(sendMessage, "popup");

export default {
    onMessage,
    sendMessage,
    sendContent,
    sendOffscreen,
    sendPopup,
    sendBackground,
    connect,
    disconnect,
    content,
    offscreen,
    background,
    popup,
};
