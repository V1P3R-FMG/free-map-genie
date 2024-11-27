import { createChannel } from "./internal";
import { createFingerprint } from "./internal/fingerprint";
import createPortChannelDriver from "./internal/drivers/port";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const port = createPortChannelDriver("popup", fingerprint);

const channel = createChannel("popup", port);

const { onMessage, sendMessage, disconnect } = channel;

const sendExtension = channel.bindSendMessage("extension");
const sendContent = channel.bindSendMessage("content-script");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendBackground = channel.bindSendMessage("background");

export { onMessage, sendMessage, sendExtension, sendContent, sendOffscreen, sendBackground, disconnect };
