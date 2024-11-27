import { createChannel } from "./internal";
import { createFingerprint } from "./internal/fingerprint";
import createPortChannelDriver from "./internal/drivers/port";

export type * from "./internal/types";

const fingerprint = createFingerprint();

const port = createPortChannelDriver("offscreen", fingerprint);

const channel = createChannel("offscreen", port);

const { onMessage, sendMessage, disconnect } = channel;

const sendExtension = channel.bindSendMessage("extension");
const sendContent = channel.bindSendMessage("content-script");
const sendBackground = channel.bindSendMessage("background");
const sendPopup = channel.bindSendMessage("popup");

export { onMessage, sendMessage, sendExtension, sendContent, sendPopup, sendBackground, disconnect };
