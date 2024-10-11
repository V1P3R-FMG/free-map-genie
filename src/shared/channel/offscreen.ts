import { createChannel } from "./internal";
import { createFingerprint } from "./internal/fingerprint";
import createPortChannelDriver from "./internal/drivers/port";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const port = createPortChannelDriver("offscreen", fingerprint);

const channel = createChannel("offscreen", port);

export const { onMessage, sendMessage } = channel;
