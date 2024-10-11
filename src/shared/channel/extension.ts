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

export const { onMessage, sendMessage } = channel;
