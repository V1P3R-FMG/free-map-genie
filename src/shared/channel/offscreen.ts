import { createChannel } from "./internal";
import { createFingerprint } from "./internal/fingerprint";
import createPortChannelDriver from "./internal/drivers/port";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const port = createPortChannelDriver("offscreen", fingerprint);

const channel = createChannel("offscreen", port);

port.onMessage((message) => logging.debug("message on offscreen", message));

// setInterval(() => port.postMessage({ type: "sync" } as any), 5000);

export const { onMessage, sendMessage, disconnect } = channel;
