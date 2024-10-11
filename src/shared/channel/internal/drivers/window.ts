import type { ChannelDriver } from "../types";

export default function createWindowChannelDriver(window: Window) {
    return {
        onMessage(cb) {
            window.addEventListener("message", (message) => cb(message.data));
        },
        postMessage(message) {
            window.postMessage(message);
        },
    } satisfies ChannelDriver;
}
