import { createChannel } from "./internal";
import { createTarget } from "./internal/target";
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

const extension = createTarget(sendMessage, "extension");
const content = createTarget(sendMessage, "content-script");
const background = createTarget(sendMessage, "background");
const popup = createTarget(sendMessage, "popup");

export default {
    onMessage,
    sendMessage,
    sendExtension,
    sendContent,
    sendPopup,
    sendBackground,
    disconnect,
    extension,
    content,
    background,
    popup,
};
