import { createChannel } from "./internal";
import { createTarget } from "./internal/target";
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

const extension = createTarget(sendMessage, "extension");
const content = createTarget(sendMessage, "content-script");
const offscreen = createTarget(sendMessage, "offscreen");
const background = createTarget(sendMessage, "background");

export default {
    onMessage,
    sendMessage,
    sendExtension,
    sendContent,
    sendOffscreen,
    sendBackground,
    disconnect,
    extension,
    content,
    offscreen,
    background,
};
