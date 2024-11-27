import { onDocumentFocusChanged } from "@shared/event";
import { isIframeContext } from "@shared/context";

import { createChannel } from "./internal";
import { createFingerprint } from "./internal/fingerprint";
import createWindowChannelDriver from "./internal/drivers/window";
import createPortChannelDriver from "./internal/drivers/port";
import { hasMessageHop, hopMessage, isInternalMessage, isMessageFor } from "./internal/message";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const win = createWindowChannelDriver(window);
const port = createPortChannelDriver("extension", fingerprint);

const channel = createChannel("extension", port);

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
    // if (port.disconnected) return;
    if (isIframeContext()) return;

    if (visible) chrome.runtime.sendMessage({ type: "focused" });
});

setTimeout(() => {
    if (port.disconnected) return;
    if (isIframeContext()) return;
    if (document.visibilityState === "hidden") return;

    logging.debug("Document is focused, sending focused message");
    chrome.runtime.sendMessage({ type: "focused" });
}, 500);

const { onMessage, sendMessage, disconnect } = channel;

const sendContent = channel.bindSendMessage("content-script");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendBackground = channel.bindSendMessage("background");
const sendPopup = channel.bindSendMessage("popup");

export { onMessage, sendMessage, sendContent, sendOffscreen, sendPopup, sendBackground, disconnect };
