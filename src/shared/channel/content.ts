import { createChannel } from "./internal";
import { createTarget } from "./internal/target";
import createWindowChannelDriver from "./internal/drivers/window";

export type * from "./internal/types";

const win = createWindowChannelDriver(window);

const channel = createChannel("content-script", win);

const { onMessage, sendMessage, disconnect } = channel;

const sendExtension = channel.bindSendMessage("extension");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendBackground = channel.bindSendMessage("background");
const sendPopup = channel.bindSendMessage("popup");

const extension = createTarget(sendMessage, "extension");
const offscreen = createTarget(sendMessage, "offscreen");
const background = createTarget(sendMessage, "background");
const popup = createTarget(sendMessage, "popup");

export default {
    onMessage,
    sendMessage,
    sendExtension,
    sendOffscreen,
    sendPopup,
    sendBackground,
    disconnect,
    extension,
    offscreen,
    background,
    popup,
};
