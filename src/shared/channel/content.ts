import { createChannel } from "./internal";
import createWindowChannelDriver from "./internal/drivers/window";

export type * from "./internal/types";

const win = createWindowChannelDriver(window);

const channel = createChannel("content-script", win);

export const { onMessage, sendMessage, disconnect } = channel;
