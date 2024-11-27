import { createChannel } from "./internal";
import createWindowChannelDriver from "./internal/drivers/window";

export type * from "./internal/types";

const win = createWindowChannelDriver(window);

const channel = createChannel("content-script", win);

const { onMessage, sendMessage, disconnect } = channel;

const sendExtension = channel.bindSendMessage("extension");
const sendOffscreen = channel.bindSendMessage("offscreen");
const sendBackground = channel.bindSendMessage("background");
const sendPopup = channel.bindSendMessage("popup");

export { onMessage, sendMessage, sendExtension, sendOffscreen, sendPopup, sendBackground, disconnect };
